import express from "express";
import {
  getFilms,
  getFilmByTitle,
  postRating,
  getUserRating,
  getAverageRating,
  getAllRatings,
} from "../controllers/filmController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Films
 *   description: Film-related operations
 */

/**
 * @swagger
 * /api/films:
 *   get:
 *     summary: Get all films
 *     tags: [Films]
 *     description: Fetches a list of all available films
 *     responses:
 *       200:
 *         description: Successfully retrieved films
 */
router.get("/", getFilms);

/**
 * @swagger
 * /api/films/{title}:
 *   get:
 *     summary: Get a film by title
 *     tags: [Films]
 *     description: Fetches details of a film using its title
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: The title of the film
 *     responses:
 *       200:
 *         description: Film details retrieved successfully
 *       404:
 *         description: Film not found
 */
router.get("/:title", getFilmByTitle);

/**
 * @swagger
 * /api/films/{id}/rate:
 *   post:
 *     summary: Rate a film
 *     tags: [Films]
 *     description: Submit a rating for a film
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the film
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               points:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       201:
 *         description: Rating submitted successfully
 *       400:
 *         description: Invalid input
 */
router.post("/:id/rate", postRating);

/**
 * @swagger
 * /api/films/{filmId}/rating/{userId}:
 *   get:
 *     summary: Get a user's rating for a film
 *     tags: [Films]
 *     description: Fetches the rating given by a specific user for a specific film
 *     parameters:
 *       - in: path
 *         name: filmId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the film
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Rating retrieved successfully
 *       404:
 *         description: Rating not found
 */
router.get("/:filmId/rating/:userId", getUserRating);

/**
 * @swagger
 * /api/films/{filmId}/average:
 *   get:
 *     summary: Get average rating of a film
 *     tags: [Films]
 *     description: Fetches the average rating of a specific film
 *     parameters:
 *       - in: path
 *         name: filmId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the film
 *     responses:
 *       200:
 *         description: Successfully retrieved average rating
 *       404:
 *         description: Film not found
 */
router.get("/:filmId/average", getAverageRating);

/**
 * @swagger
 * /api/films/ratings/all:
 *   get:
 *     summary: Get all ratings
 *     tags: [Films]
 *     description: Fetches all ratings submitted by users
 *     responses:
 *       200:
 *         description: Successfully retrieved all ratings
 */
router.get("/ratings/all", getAllRatings);

export default router;
