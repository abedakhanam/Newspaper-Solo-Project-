import { Request, Response } from 'express';
import { Article, ArticleCreationAttributes } from '../models/article';
import Comment from '../models/comment'; // Import Comment model
import { Category } from '../models/category';

//get all the articles
export const getArticles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const articles = await Article.findAll({
      attributes: ['title', 'description', 'thumbnailUrl', 'createdAt'], // Only get these fields
    });
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Get a single article by ID with specified fields and associated categories and comments
export const getArticleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const article = await Article.findByPk(id, {
      attributes: ['title', 'description', 'content', 'createdAt'], // Include only specified fields
      include: [
        {
          model: Comment,
          attributes: ['id', 'content', 'createdAt'],
          as: 'articleComments',
        },
        {
          model: Category,
          through: { attributes: [] }, // Avoid showing the junction table data
          attributes: ['id', 'name'], // Include category details
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

// Create a new article with all fields, including categories
export const createArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { title, description, content, thumbnailUrl, categoryIds } = req.body;

  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const authorId = req.user.id; // Get the authorId from the token

    const article = await Article.create({
      title,
      description,
      content,
      thumbnailUrl,
      authorId, // Use the authorId from the token
    } as ArticleCreationAttributes);

    // Associate categories with the article
    if (categoryIds && categoryIds.length > 0) {
      const categories = await Category.findAll({
        where: {
          id: categoryIds,
        },
      });
      await article.setCategories(categories);
    }

    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update an existing article, including all fields and categories, if the author is authorized
export const updateArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { title, description, content, thumbnailUrl, categoryIds } = req.body;

  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const article = await Article.findByPk(id);

    if (article && article.authorId === req.user.id) {
      // Update article fields
      article.title = title || article.title;
      article.description = description || article.description;
      article.content = content || article.content;
      article.thumbnailUrl = thumbnailUrl || article.thumbnailUrl;

      await article.save();

      // Update categories
      if (categoryIds && categoryIds.length > 0) {
        const categories = await Category.findAll({
          where: {
            id: categoryIds,
          },
        });
        await article.setCategories(categories);
      }

      res.json(article);
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete an article if the user is authorized
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

// Add categories to an existing article
export const addCategoriesToArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const articleId = req.params.id; // Get articleId from URL parameters
  const { categoryIds } = req.body; // Get categoryIds from the request body

  try {
    // Find the article
    const article = await Article.findByPk(articleId);

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // Find categories and associate them with the article
    const categories = await Category.findAll({
      where: {
        id: categoryIds,
      },
    });

    if (categories.length !== categoryIds.length) {
      res.status(404).json({ error: 'Some categories not found' });
      return;
    }

    await article.setCategories(categories);

    res
      .status(200)
      .json({ message: 'Categories added to article successfully' });
    return;
  } catch (error) {
    console.error('Error adding categories to article:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};
