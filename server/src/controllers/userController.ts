import { Request, Response } from 'express';
import User from '../models/user';

// Get user details by ID
export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user information
export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  try {
    const user = await User.findByPk(id);
    if (user) {
      if (username) user.username = username;
      if (email) user.email = email;
      if (password) user.password = password; // Consider hashing the password before saving

      await user.save();
      return res.json(user);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (user) {
      await user.destroy();
      return res.status(204).send(); // No content
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
