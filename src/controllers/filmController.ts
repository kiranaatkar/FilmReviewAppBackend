import { Request, Response } from "express";
import FilmService from "../services/filmService";

export const getFilms = async (req: Request, res: Response) => {
  const films = await FilmService.getFilms();
  res.json(films);
};

export const getFilmById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const film = await FilmService.getFilm(id);
  res.json(film);
};
