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

export const createFilm = async (req: Request, res: Response) => {
  const { title, year } = req.body;

  if (!title || typeof title !== "string") {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "title is required and must be a string" });
    return;
  }

  if (year !== undefined && typeof year !== "number") {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "year must be a number if provided" });
    return;
  }

  try {
    const film = await FilmService.createFilmFromMetadata(title, year);

    if (!film) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Could not fetch film metadata" });
      return;
    }

    res.status(StatusCodes.CREATED).json(film);
  } catch (error: any) {
    console.error("Error creating film:", error);

    if (error.message === "Film already exists") {
      res.status(StatusCodes.CONFLICT).json({ error: error.message });
      return;
    }

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
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: `Film with title "${title}" not found` });
      return;
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
  if (!rating) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Rating is required" });
    return;
  }

  try {
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
      res.status(404).json({
        error: `No rating found for film ID ${filmId} by user ID ${userId}`,
      });
      return;
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