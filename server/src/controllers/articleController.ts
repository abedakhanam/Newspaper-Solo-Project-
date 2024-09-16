import { Request, Response } from 'express';
import { Article, ArticleCreationAttributes } from '../models/article';
import Comment from '../models/comment'; // Import the Comment model
import { Category } from '../models/category';
// List all articles sorted by recency
export const getArticles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const articles = await Article.findAll({
      order: [['createdAt', 'DESC']], // Sort by recency
      attributes: [
        'id',
        'title',
        'content',
        'thumbnailUrl',
        'authorId',
        'createdAt',
        'updatedAt',
      ], // Use authorId
      include: [
        {
          model: Comment,
          attributes: ['userId', 'content'],
          as: 'articleComments', // Use the alias defined in associations
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
// Get a single article by ID with details and associated categories
// export const getArticleById = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { id } = req.params;

//   try {
//     const article = await Article.findByPk(id, {
//       include: [
//         {
//           model: Comment,
//           attributes: ['id', 'content', 'createdAt'],
//           as: 'articleComments',
//         },
//         {
//           model: Category,
//           through: { attributes: [] }, // Prevent junction table data from being included
//           attributes: ['id', 'name'], // Include category details
//         },
//       ],
//     });

//     if (article) {
//       res.json(article);
//     } else {
//       res.status(404).json({ error: 'Article not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching article:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
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
          as: 'articleComments',
        },
        {
          model: Category,
          through: { attributes: [] }, // Avoid showing the ArticleCategories table data
          attributes: ['id', 'name'], // Only include necessary fields
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
    } as ArticleCreationAttributes);

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

// Add categories to an existing article
export const addCategoriesToArticle = async (req: Request, res: Response) => {
  const articleId = req.params.id; // Get articleId from URL parameters
  const { categoryIds } = req.body; // Get categoryIds from the request body

  try {
    // Find the article and categories
    const article = await Article.findByPk(articleId);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const categories = await Category.findAll({
      where: {
        id: categoryIds,
      },
    });

    if (categories.length !== categoryIds.length) {
      return res.status(404).json({ error: 'Some categories not found' });
    }

    // Add categories to the article
    await article.addCategories(categories);

    return res
      .status(200)
      .json({ message: 'Categories added to article successfully' });
  } catch (error) {
    console.error('Error adding categories to the article:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get categories associated with an article
