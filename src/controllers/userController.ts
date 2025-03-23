import { Request, Response } from "express";
import UserService from "../services/userService";
import { StatusCodes } from "http-status-codes";

export const createUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Name and password is required" });
    return;
  }

  try {
    const user = await UserService.createUser(username, password);
    res.status(StatusCodes.CREATED).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
}

export const signInUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Name and password is required" });
    return;
  }

  try {
    const user = await UserService.signInUser(username, password);
    res.json(user);
  } catch (error) {
    console.error("Error logging in:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
}

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};