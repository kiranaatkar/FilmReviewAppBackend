import { User } from "../types/filmTypes";
import pool from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

class UserService {
  static async createUser(
    username: string,
    password: string
  ): Promise<string | { token: string }> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { rows } = await pool.query(
        "INSERT INTO users (username, hashed_password) VALUES ($1, $2) RETURNING id",
        [username, hashedPassword]
      );

      if (rows.length === 0) {
        throw new Error("User creation failed");
      }

      const userId: number = rows[0].id;
      const token = this.createToken(userId, username);
      return { token };
    } catch (error: any) {
      console.error("Error creating user:", error);
      return `Error: ${error.message}`;
    }
  }

  static async signInUser(
    username: string,
    password: string
  ): Promise<string | { token: string }> {
    try {
      const { rows } = await pool.query<{
        id: number;
        hashed_password: string;
      }>("SELECT id, hashed_password FROM users WHERE username = $1", [
        username,
      ]);
      if (rows.length === 0) {
        return "User not found";
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.hashed_password);
      if (!match) {
        return "Invalid password";
      }
      const token = this.createToken(user.id, username);
      return { token };
    } catch (error: any) {
      console.error("Error logging in:", error);
      return `Error: ${error.message}`;
    }
  }

  static createToken(userId: number, username: string): string {
    return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: "7d" });
  }

  static async getAllUsers(): Promise<User[]> {
    const { rows: users } = await pool.query<User>("SELECT * FROM users");
    return users;
  }
}

export default UserService;
