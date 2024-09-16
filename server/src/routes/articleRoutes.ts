import { Router } from 'express';
import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  addCategoriesToArticle,
  // getCategoriesForArticle,
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
router.post(
  '/articles/:id/categories',
  authenticateToken,
  addCategoriesToArticle
);
// Route to get categories associated with an article
// router.get(
//   '/articles/:id/categories',
//   authenticateToken,
//   getCategoriesForArticle
// );

export default router;
