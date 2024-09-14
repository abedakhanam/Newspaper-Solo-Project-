import { Router } from 'express';
import {
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Protected routes
router.get('/users/:id', authenticateToken, getUserById);
router.put('/users/:id', authenticateToken, updateUser);
router.delete('/users/:id', authenticateToken, deleteUser);

export default router;
