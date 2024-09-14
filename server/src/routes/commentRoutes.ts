import { Router } from 'express';
import { createComment } from '../controllers/commentController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Protected route for adding a comment to a specific article
router.post('/articles/:articleId/comments', authenticateToken, createComment);

export default router;
