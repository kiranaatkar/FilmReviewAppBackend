import { Film, Rating, RatingPoint } from "../types/filmTypes";
import pool from "../config/db";

class FilmService {
static async getFilms(): Promise<Film[]> {
  console.log("Executing getFilms query");
    const { rows } = await pool.query<Film>(`
      SELECT
        f.id,
        f.title,
        f.year,
        f.poster_url AS "posterUrl",
        f.runtime,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name))
          FILTER (WHERE g.id IS NOT NULL),
          '[]'
        ) AS genres,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', d.id, 'name', d.name))
          FILTER (WHERE d.id IS NOT NULL),
          '[]'
        ) AS directors,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name))
          FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) AS actors
      FROM film f
      LEFT JOIN film_genre fg ON f.id = fg.film_id
      LEFT JOIN genre g ON fg.genre_id = g.id
      LEFT JOIN film_director fd ON f.id = fd.film_id
      LEFT JOIN director d ON fd.director_id = d.id
      LEFT JOIN film_actor fa ON f.id = fa.film_id
      LEFT JOIN actor a ON fa.actor_id = a.id
      GROUP BY f.id
      ORDER BY f.id;
    `);

    return rows;
  }

  // Get a single film by title with genres, directors, and actors
  static async getFilm(title: string): Promise<Film | null> {
    const { rows } = await pool.query<Film>(
      `
      SELECT
        f.id,
        f.title,
        f.year,
        f.poster_url AS "posterUrl",
        f.runtime,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name))
          FILTER (WHERE g.id IS NOT NULL),
          '[]'
        ) AS genres,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', d.id, 'name', d.name))
          FILTER (WHERE d.id IS NOT NULL),
          '[]'
        ) AS directors,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name))
          FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) AS actors
      FROM film f
      LEFT JOIN film_genre fg ON f.id = fg.film_id
      LEFT JOIN genre g ON fg.genre_id = g.id
      LEFT JOIN film_director fd ON f.id = fd.film_id
      LEFT JOIN director d ON fd.director_id = d.id
      LEFT JOIN film_actor fa ON f.id = fa.film_id
      LEFT JOIN actor a ON fa.actor_id = a.id
      WHERE f.title = $1
      GROUP BY f.id;
      `,
      [title]
    );

    return rows[0] || null;
  }

  static async postRating(rating: Rating): Promise<string> {
    try {
      // get existing rating if it exists, or create a new one
      let ratingId: number | null = null;
      const existingRating: Rating | null = await FilmService.getUserRating(
        rating.userId,
        rating.filmId
      );
      if (existingRating?.id) {
        // update updated_at timestamp, delete existing points
        await pool.query("UPDATE rating SET updated_at = NOW() WHERE id = $1", [
          existingRating.id,
        ]);
        await pool.query("DELETE FROM rating_point WHERE rating_id = $1", [
          existingRating.id,
        ]);
        ratingId = existingRating.id;
      } else {
        const { rows } = await pool.query<{ id: number }>(
          "INSERT INTO rating (user_id, film_id) VALUES ($1, $2) RETURNING id",
          [rating.userId, rating.filmId]
        );
        ratingId = rows[0].id;
      }
      // add rating points
      await Promise.all(
        rating.points.map((point: RatingPoint) =>
          pool.query(
            "INSERT INTO rating_point (rating_id, point_index, x, y) VALUES ($1, $2, $3, $4)",
            [ratingId, point.point_index, point.x, point.y]
          )
        )
      );
      return "ok";
    } catch (error: any) {
      console.error("Error posting rating:", error);
      return `Error: ${error.message}`;
    }
  }

  static async getUserRating(
    userId: number,
    filmId: number
  ): Promise<Rating | null> {
    try {
      const { rows } = await pool.query<Rating>(
        "SELECT * FROM rating WHERE user_id = $1 AND film_id = $2",
        [userId, filmId]
      );
      if (rows.length === 0) {
        return null;
      }

      const rating = rows[0];
      const { rows: points } = await pool.query<RatingPoint>(
        "SELECT x, y, point_index FROM rating_point WHERE rating_id = $1 ORDER BY point_index",
        [rating.id]
      );
      rating.points = points;
      return rating;
    } catch (error: any) {
      console.error("Error getting user rating:", error);
      return null;
    }
  }

  static async getAverageRating(filmId: number): Promise<RatingPoint[]> {
    try {
      const { rows } = await pool.query<{
        point_index: number;
        avg_x: number;
        avg_y: number;
      }>(
        `SELECT point_index, AVG(x) AS avg_x, AVG(y) AS avg_y 
         FROM rating_point 
         WHERE rating_id IN (SELECT id FROM rating WHERE film_id = $1) 
         GROUP BY point_index 
         ORDER BY point_index`,
        [filmId]
      );

      return rows.map((row) => ({
        point_index: row.point_index,
        x: parseFloat(row.avg_x.toFixed(2)),
        y: parseFloat(row.avg_y.toFixed(2)),
      }));
    } catch (error: any) {
      console.error("Error getting average rating:", error);
      return [];
    }
  }

  // testing methods
  static async getAllRatings(): Promise<Rating[]> {
    const { rows: ratings } = await pool.query<Rating>("SELECT * FROM rating");
    return ratings;
  }
}

export default FilmService;
