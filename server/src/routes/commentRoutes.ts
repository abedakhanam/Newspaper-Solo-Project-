// src/routes/commentRoutes.ts
import { Router } from 'express';
import {
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/commentController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Protected route for adding a comment to a specific article
router.post('/articles/:articleId/comments', authenticateToken, createComment);

// Protected route for updating a specific comment
router.put('/comments/:commentId', authenticateToken, updateComment);

// Protected route for deleting a specific comment
router.delete('/comments/:commentId', authenticateToken, deleteComment);

export default router;
