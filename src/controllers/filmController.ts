import { Request, Response } from "express";
import FilmService from "../services/filmService";
import { StatusCodes } from "http-status-codes";
import { FilmPreview } from "../types/filmTypes";

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

export const getFilmPreviews = async (req: Request, res: Response) => {
  const { userId, filmIds } = req.body as {
    userId: number;
    filmIds: number[];
  };

  console.log("Received getFilmPreviews request with userId:", userId, "and filmIds:", filmIds);

  if (Number.isNaN(userId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: "userId is required and must be a number",
    });
    return;
  }

  if (!Array.isArray(filmIds) || !filmIds.every((id) => Number.isInteger(id))) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: "filmIds must be an array of integers",
    });
    return;
  }

  try {
    const previews: FilmPreview[] = await FilmService.getFilmPreviews(userId, filmIds);
    res.status(StatusCodes.OK).json(previews);
  } catch (error) {
    console.error("Error fetching film previews:", error);
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

  let parsedYear: number | undefined = undefined;

  if (year !== undefined && year !== null && year !== "") {
    parsedYear = Number(year);

    if (Number.isNaN(parsedYear)) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "year must be a valid number if provided" });
      return;
    }
  }

  try {
    const film = await FilmService.createFilmFromMetadata(title.trim(), parsedYear);

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

    if (error.message === "OMDB_API_KEY is not configured") {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
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
  const { id } = req.params;
  const { userId, points } = req.body;

  const filmId = parseInt(id, 10);

  if (Number.isNaN(filmId)) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid film id" });
    return;
  }

  if (!userId || !Array.isArray(points)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: "userId and points are required",
    });
    return;
  }

  try {
    const result = await FilmService.postRating({
      userId,
      filmId,
      points,
    });

    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    console.error("Error posting rating:", error);
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