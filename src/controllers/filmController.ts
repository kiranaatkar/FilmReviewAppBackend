import { Request, Response } from "express";
import FilmService from "../services/filmService";
import { StatusCodes } from "http-status-codes";

export const getFilms = async (req: Request, res: Response) => {
  try {
    const films = await FilmService.getFilms();
    res.json(films);
  } catch (error) {
    console.error("Error fetching film:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const getFilmByTitle = async (req: Request, res: Response) => {
  const { title } = req.params;
  try {
    const film = await FilmService.getFilm(title);
    if (!film) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `Film with title "${title}" not found` });
    }

    res.status(StatusCodes.OK).json(film);
  } catch (error) {
    console.error("Error fetching film:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const postRating = async (req: Request, res: Response) => {
  const rating = req.body?.rating;
  try {
    if (!rating) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Rating is required" });
    }

    const film = await FilmService.getFilm(rating.filmId);
    if (!film) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `Film with ID ${rating.filmId} not found` });
    }

    const result = await FilmService.postRating(rating);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    console.error("Error fetching film:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const getUserRating = async (req: Request, res: Response) => {
  const { filmId, userId } = req.params;
  try {
    const rating = await FilmService.getUserRating(
      parseInt(userId),
      parseInt(filmId)
    );
  
    if (!rating) {
      return res
        .status(404)
        .json({
          error: `No rating found for film ID ${filmId} by user ID ${userId}`,
        });
    }
  
    res.json(rating);
  } catch (error) {
    console.error("Error fetching film:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const getAllRatings = async (req: Request, res: Response) => {
  try {
    const ratings = await FilmService.getAllRatings();
    res.json(ratings);
  } catch (error) {
    console.error("Error fetching film:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const getAverageRating = async (req: Request, res: Response) => {
  const { filmId } = req.params;
  try {
    const average = await FilmService.getAverageRating(parseInt(filmId));
    res.json(average);
  } catch (error) {
    console.error("Error fetching film:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};
