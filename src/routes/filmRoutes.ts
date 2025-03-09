import express from "express";
import { getFilms, getFilmByTitle, postRating, getUserRating, getAverageRating, getAllRatings } from "../controllers/filmController";

const router = express.Router();

router.get("/", getFilms);
router.get("/:title", getFilmByTitle);
router.post("/:id/rate", postRating);
router.get("/:filmId/rating/:userId", getUserRating);
router.get("/:filmId/average", getAverageRating);
router.get("/ratings/all", getAllRatings);

export default router;
