import express from "express";
import {
  createUser,
  getAllUsers,
  signInUser,
} from "../controllers/userController";

const router = express.Router();

router.get("/all", getAllUsers);

router.post("/create", createUser);

router.post("/signin", signInUser);

export default router;
