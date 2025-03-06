import { Film, FilmTitle } from "../types/filmTypes";
import pool from "../config/db";

class FilmService {
  static async getFilms(): Promise<FilmTitle[]> {
    const { rows } = await pool.query<FilmTitle>("SELECT * FROM film");
    return rows;
  }

  static async getFilm(id: string): Promise<Film | null> {
    const { rows } = await pool.query<Film>("SELECT * FROM film WHERE id = $1", [id]);
    return rows[0] || null;
  }
}

export default FilmService;
