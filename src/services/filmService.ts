import axios from "axios";
import { Film, Rating, RatingPoint } from "../types/filmTypes";
import pool from "../config/db";

type OmdbResponse = {
  Title: string;
  Year: string;
  Runtime: string;
  Poster: string;
  Genre: string;
  Director: string;
  Actors: string;
  Response: string;
  Error?: string;
};

class FilmService {
  static async getFilms(): Promise<Film[]> {
    const { rows } = await pool.query<Film>(`
      SELECT
        f.id,
        f.title,
        f.year,
        f.poster_url AS "posterUrl",
        f.runtime,
        f.created_at AS "createdAt",
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

  static async getFilm(title: string): Promise<Film | null> {
    const { rows } = await pool.query<Film>(
      `
      SELECT
        f.id,
        f.title,
        f.year,
        f.poster_url AS "posterUrl",
        f.runtime,
        f.created_at AS "createdAt",
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

  static async getFilmByTitleAndYear(
    title: string,
    year: number
  ): Promise<Film | null> {
    const { rows } = await pool.query<Film>(
      `
      SELECT
        f.id,
        f.title,
        f.year,
        f.poster_url AS "posterUrl",
        f.runtime,
        f.created_at AS "createdAt",
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
      WHERE f.title = $1 AND f.year = $2
      GROUP BY f.id;
      `,
      [title, year]
    );

    return rows[0] || null;
  }

  static async createFilmFromMetadata(
    title: string,
    year?: number
  ): Promise<Film | null> {
    const apiKey = process.env.OMDB_API_KEY;

    if (!apiKey) {
      throw new Error("OMDB_API_KEY is not configured");
    }

    const params: Record<string, string> = {
      apikey: apiKey,
      t: title,
    };

    if (year !== undefined) {
      params.y = year.toString();
    }

    const { data } = await axios.get<OmdbResponse>("http://www.omdbapi.com/", {
      params,
    });

    if (data.Response === "False") {
      return null;
    }

    const parsedYear = parseInt(data.Year, 10);
    const runtime = parseInt(data.Runtime.replace(" min", ""), 10);

    if (Number.isNaN(parsedYear) || Number.isNaN(runtime)) {
      throw new Error("Invalid metadata returned from OMDb");
    }

    const existingFilm = await FilmService.getFilmByTitleAndYear(
      data.Title,
      parsedYear
    );

    if (existingFilm) {
      throw new Error("Film already exists");
    }

    const genres = data.Genre
      ? data.Genre.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    const directors = data.Director
      ? data.Director.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    const actors = data.Actors
      ? data.Actors.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const filmInsert = await client.query<{ id: number }>(
        `
        INSERT INTO film (title, year, poster_url, runtime)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [
          data.Title,
          parsedYear,
          data.Poster !== "N/A" ? data.Poster : null,
          runtime,
        ]
      );

      const filmId = filmInsert.rows[0].id;

      for (const genreName of genres) {
        const genreId = await this.getOrCreateGenreId(client, genreName);
        await client.query(
          `
          INSERT INTO film_genre (film_id, genre_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
          `,
          [filmId, genreId]
        );
      }

      for (const directorName of directors) {
        const directorId = await this.getOrCreateDirectorId(client, directorName);
        await client.query(
          `
          INSERT INTO film_director (film_id, director_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
          `,
          [filmId, directorId]
        );
      }

      for (const actorName of actors) {
        const actorId = await this.getOrCreateActorId(client, actorName);
        await client.query(
          `
          INSERT INTO film_actor (film_id, actor_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
          `,
          [filmId, actorId]
        );
      }

      await client.query("COMMIT");

      return await FilmService.getFilmByTitleAndYear(data.Title, parsedYear);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private static async getOrCreateGenreId(
    client: any,
    name: string
  ): Promise<number> {
    const insertResult = await client.query(
      `
      INSERT INTO genre (name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING
      RETURNING id
      `,
      [name]
    );

    if (insertResult.rows.length > 0) {
      return insertResult.rows[0].id;
    }

    const selectResult = await client.query(
      `SELECT id FROM genre WHERE name = $1`,
      [name]
    );

    return selectResult.rows[0].id;
  }

  private static async getOrCreateDirectorId(
    client: any,
    name: string
  ): Promise<number> {
    const insertResult = await client.query(
      `
      INSERT INTO director (name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING
      RETURNING id
      `,
      [name]
    );

    if (insertResult.rows.length > 0) {
      return insertResult.rows[0].id;
    }

    const selectResult = await client.query(
      `SELECT id FROM director WHERE name = $1`,
      [name]
    );

    return selectResult.rows[0].id;
  }

  private static async getOrCreateActorId(
    client: any,
    name: string
  ): Promise<number> {
    const insertResult = await client.query(
      `
      INSERT INTO actor (name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING
      RETURNING id
      `,
      [name]
    );

    if (insertResult.rows.length > 0) {
      return insertResult.rows[0].id;
    }

    const selectResult = await client.query(
      `SELECT id FROM actor WHERE name = $1`,
      [name]
    );

    return selectResult.rows[0].id;
  }

  static async postRating(rating: Rating): Promise<string> {
    try {
      let ratingId: number | null = null;
      const existingRating: Rating | null = await FilmService.getUserRating(
        rating.userId,
        rating.filmId
      );

      if (existingRating?.id) {
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

  static async getAllRatings(): Promise<Rating[]> {
    const { rows: ratings } = await pool.query<Rating>("SELECT * FROM rating");
    return ratings;
  }
}

export default FilmService;