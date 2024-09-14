import { Router } from 'express';
import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.get('/articles', getArticles);
router.get('/articles/:id', getArticleById);

// Protected routes
router.post('/articles', authenticateToken, createArticle);
router.put('/articles/:id', authenticateToken, updateArticle);
router.delete('/articles/:id', authenticateToken, deleteArticle);

export default router;
