import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user"; // Ensure the path is correct
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    // Hash the password before saving
    const hashedPassword = await User.hashPassword(password);

    // Create a new user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Respond with the new user info
    res
      .status(201)
      .json({ id: user.id, username: user.username, email: user.email });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ where: { username } });
    if (user && (await user.comparePassword(password))) {
      // Generate JWT token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      // Send token in the response body or another header
      res.json({ message: "Logged in successfully", token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response): void => {
  // Simply notify logout; no cookie to clear
  res.status(200).json({ message: "Logged out successfully" });
};
