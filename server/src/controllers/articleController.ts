import { Request, Response } from 'express';
import Article from '../models/article';
import Comment from '../models/comment'; // Import the Comment model
import jwt from 'jsonwebtoken';

// List all articles sorted by recency
export const getArticles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const articles = await Article.findAll({
      order: [['createdAt', 'DESC']], // Sort by recency
      attributes: ['id', 'title', 'thumbnailUrl', 'authorId', 'createdAt'], // Use authorId
      include: [
        {
          model: Comment,
          attributes: ['id', 'content'],
          as: 'comments',
        },
      ],
    });

    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single article by ID with details
export const getArticleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const article = await Article.findByPk(id, {
      include: [
        {
          model: Comment,
          attributes: ['id', 'content', 'createdAt'],
          as: 'comments',
        },
      ],
    });

    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new article
export const createArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { title, content, thumbnailUrl } = req.body;

  try {
    // Ensure the user is authenticated
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const authorId = req.user.id; // Get the authorId from the token

    const article = await Article.create({
      title,
      content,
      thumbnailUrl,
      authorId, // Use the authorId from the token
    });

    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update an existing article
export const updateArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { title, content, thumbnailUrl } = req.body;

  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const article = await Article.findByPk(id);

    if (article && article.authorId === req.user.id) {
      article.title = title || article.title;
      article.content = content || article.content;
      article.thumbnailUrl = thumbnailUrl || article.thumbnailUrl;

      await article.save();
      res.json(article);
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete an article
export const deleteArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const article = await Article.findByPk(id);

    if (article && article.authorId === req.user.id) {
      await article.destroy();
      res.status(204).send();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
