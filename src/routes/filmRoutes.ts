import express from "express";
import { getFilms, getFilmById } from "../controllers/filmController";

const router = express.Router();

router.get("/", getFilms);
router.get("/:id", getFilmById);

export default router;
