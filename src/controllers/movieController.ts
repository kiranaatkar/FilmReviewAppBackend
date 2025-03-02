import { Request, Response } from "express";
import MovieService from "../services/movieService";

export const getMovies = async (req: Request, res: Response) => {
  const movies = await MovieService.getMovieTitles();
  res.json(movies);
};

export const getMovieById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const movie = await MovieService.getMovie(id);
  res.json(movie);
};
