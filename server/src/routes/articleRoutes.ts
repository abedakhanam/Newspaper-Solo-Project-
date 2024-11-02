// src/routes/articleRoutes.ts

import { Router } from "express";
import {
  // createArticle,
  getArticlesByUserId,
  getArticleById,
  // getArticles,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController";
import { authenticateToken } from "../middlewares/authMiddleware";
import upload from "../middlewares/upload";
import { getArticles, createArticle } from "../controllers/djangocontroller";

const router = Router()

// Public routes
router.get("/articles", getArticles);
router.get("/articles/:id", getArticleById);
// Protected routes
router.get("/articles/user/me", authenticateToken, getArticlesByUserId); // Fetch user's own articles
router.post(
  "/articles",
  authenticateToken,
  upload.single("thumbnail"),
  createArticle
);
router.put(
  "/articles/:id",
  authenticateToken,
  upload.single("thumbnail"), // Include the upload middleware here
  updateArticle
);
router.delete("/articles/:id", authenticateToken, deleteArticle);

export default router;
