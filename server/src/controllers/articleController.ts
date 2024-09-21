import { Request, Response } from 'express';
import { Article, ArticleCreationAttributes } from '../models/article';
import Comment from '../models/comment'; // Import Comment model
import { Category } from '../models/category';
import User from '../models/user';
import { Op, Sequelize } from 'sequelize';

// Get all the articles
export const getArticles = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { page = 1, limit = 10 } = req.query;

  // Convert page and limit to numbers
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  // Ensure valid pagination values
  if (pageNumber < 1 || limitNumber < 1) {
    res.status(400).json({ error: 'Page and limit must be positive numbers' });
    return;
  }

  try {
    const offset = (pageNumber - 1) * limitNumber;
    const { count, rows } = await Article.findAndCountAll({
      attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'],
      include: [
        {
          model: User,
          attributes: ['username'], // Include the author's username
          as: 'author', // Ensure this matches the alias defined in associations
        },
      ],
      limit: limitNumber,
      offset: offset,
      order: [['createdAt', 'DESC']], // Sort by createdAt in descending order
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limitNumber),
      currentPage: pageNumber,
      articles: rows,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getArticlesByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const { page = 1, limit = 10 } = req.query;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  if (pageNumber < 1 || limitNumber < 1) {
    res.status(400).json({ error: 'Page and limit must be positive numbers' });
    return;
  }

  try {
    const offset = (pageNumber - 1) * limitNumber;
    const { count, rows } = await Article.findAndCountAll({
      attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'],
      where: { authorId: userId },
      limit: limitNumber,
      offset: offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['username'], // Include the author's username
          as: 'author', // Ensure this matches the alias defined in associations
        },
      ],
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limitNumber),
      currentPage: pageNumber,
      articles: rows,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single article by ID
// export const getArticleById = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { id } = req.params;

//   try {
//     const article = await Article.findByPk(id, {
//       attributes: [
//         'title',
//         'description',
//         'content',
//         'thumbnailUrl',
//         'createdAt',
//       ],
//       include: [
//         {
//           model: Comment,
//           attributes: ['id', 'content', 'createdAt'],
//           as: 'articleComments',
//           include: [
//             {
//               model: User,
//               attributes: ['username'],
//             },
//           ],
//         },
//         {
//           model: Category,
//           through: { attributes: [] },
//           attributes: ['id', 'name'],
//         },
//         {
//           model: User,
//           attributes: ['username'],
//           as: 'author', // Ensure this matches the alias defined in associations
//         },
//       ],
//     });

//     if (article) {
//       res.json(article); // The article should include the author data now
//     } else {
//       res.status(404).json({ error: 'Article not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching article:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// export const getArticleById = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const articleId = req.params.id;

//   try {
//     // Fetch the article along with its associated categories and comments
//     const article = await Article.findOne({
//       where: { id: articleId },
//       include: [
//         { model: Category, as: 'categories' },
//         { model: Comment, as: 'articleComments' },
//         { model: User, as: 'author' },
//       ],
//     });

//     if (!article) {
//       res.status(404).json({ error: 'Article not found' });
//       return;
//     }

//     console.log('Fetched article:', article.toJSON());

//     // Check if categories are defined and get category IDs
//     const categoryIds = article.categories
//       ? article.categories.map((category) => category.id)
//       : [];
//     console.log('Category IDs:', categoryIds);

//     // Fetch related articles based on categories
//     const relatedArticles = await Article.findAll({
//       include: [
//         {
//           model: Category,
//           as: 'categories',
//           where: { id: categoryIds },
//         },
//       ],
//       where: {
//         id: { [Op.ne]: articleId }, // Exclude the current article
//       },
//       limit: 5, // Limit the number of related articles
//     });

//     // Prepare the response
//     res.status(200).json({
//       article,
//       relatedArticles,
//     });
//   } catch (error) {
//     console.error('Error fetching article:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }; //correct related

// export const getArticleById = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { id } = req.params;

//   try {
//     // Fetch the article along with the author and categories
//     const article = await Article.findOne({
//       where: { id },
//       include: [
//         {
//           model: User,
//           as: 'author',
//           attributes: ['username'],
//         },
//         {
//           model: Comment,
//           as: 'articleComments', // Ensure this matches the alias defined in associations
//           include: [
//             {
//               model: User,
//               attributes: ['username'], // Include the username of the commenter
//             },
//           ],
//         },
//         {
//           model: Category,
//           as: 'categories',
//           attributes: ['id', 'name'],
//         },
//       ],
//     });

//     if (!article) {
//       res.status(404).json({ error: 'Article not found' });
//       return;
//     }

//     // Log the retrieved article
//     console.log('Fetched Article:', JSON.stringify(article, null, 2));

//     // Return the article with comments
//     res.json({
//       article,
//       comments: article.articleComments, // Include the comments in the response
//     });
//   } catch (error) {
//     console.error('Error fetching article:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// }; comment correct

// export const getArticleById = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { id } = req.params;

//   try {
//     // Fetch the article along with the author and comments
//     const article = await Article.findOne({
//       where: { id },
//       include: [
//         {
//           model: User,
//           as: 'author',
//           attributes: ['username'],
//         },
//         {
//           model: Comment,
//           as: 'articleComments',
//           include: [
//             {
//               model: User,
//               attributes: ['username'], // Include the username of the commenter
//             },
//           ],
//         },
//         {
//           model: Category,
//           as: 'categories',
//           attributes: ['id', 'name'],
//         },
//       ],
//     });

//     if (!article) {
//       res.status(404).json({ error: 'Article not found' });
//       return;
//     }

//     // Log the retrieved article
//     console.log('Fetched Article:', JSON.stringify(article, null, 2));

//     // Check if categories are defined and get category IDs
//     const categoryIds = article.categories
//       ? article.categories.map((category) => category.id)
//       : [];

//     // Fetch related articles based on categories, limiting the fields returned
//     const relatedArticles = await Article.findAll({
//       include: [
//         {
//           model: User,
//           as: 'author',
//           attributes: ['username'], // Only include author username
//         },
//       ],
//       where: {
//         id: { [Op.ne]: id }, // Exclude the current article
//       },
//       attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'], // Only include specified fields
//       limit: 5, // Limit the number of related articles
//     });

//     // Prepare the response
//     res.status(200).json({
//       article,
//       relatedArticles,
//     });
//   } catch (error) {
//     console.error('Error fetching article:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };all except cateroi list

export const getArticleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    // Fetch the article along with the author, comments, and categories
    const article = await Article.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username'],
        },
        {
          model: Comment,
          as: 'articleComments',
          include: [
            {
              model: User,
              attributes: ['username'], // Include the username of the commenter
            },
          ],
        },
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // Log the retrieved article
    console.log('Fetched Article:', JSON.stringify(article, null, 2));

    // Fetch related articles based on categories, excluding the current article
    const relatedArticles = await Article.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username'],
        },
      ],
      where: {
        id: { [Op.ne]: id }, // Exclude the current article
      },
      attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'],
      limit: 5,
    });

    // Prepare the response
    res.status(200).json({
      article: {
        ...article.get(), // Use get() to convert Sequelize instance to plain object
        categories: article.categories, // Include categories in the article response
      },
      relatedArticles,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Create a new article

export const createArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { title, description, content, categoryIds } = req.body;

  // Set thumbnailUrl to the uploaded file's path or use a default URL
  const thumbnailUrl = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.thumbnailUrl;

  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const authorId = req.user.id;

    const article = await Article.create({
      title,
      description,
      content,
      thumbnailUrl, // Save thumbnailUrl
      authorId,
    } as ArticleCreationAttributes);

    // If category IDs are provided, associate them with the article
    if (categoryIds && categoryIds.length > 0) {
      const categories = await Category.findAll({
        where: {
          id: categoryIds,
        },
      });
      await article.setCategories(categories);
    }

    // Fetch the associated categories for the response
    const associatedCategories = await article.getCategories({
      attributes: ['id', 'name'], // Specify the attributes you want
    });

    // Send back the created article along with category IDs
    res.status(201).json({
      article,
      categoryIds: associatedCategories.map((cat) => cat.id), // Include category IDs
    });
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
  const { title, description, content, categoryIds } = req.body; // Ensure categoryIds is included

  // Handle uploaded thumbnail file
  const uploadedThumbnailUrl = req.file
    ? `/uploads/${req.file.filename}`
    : undefined;

  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const article = await Article.findByPk(id);

    if (article && article.authorId === req.user.id) {
      // Update the article's attributes
      article.title = title || article.title;
      article.description = description || article.description;
      article.content = content || article.content;

      // Update thumbnailUrl based on uploaded file or provided URL
      if (uploadedThumbnailUrl) {
        article.thumbnailUrl = uploadedThumbnailUrl;
      }

      await article.save();

      // Update categories if provided
      if (categoryIds && categoryIds.length > 0) {
        const categories = await Category.findAll({
          where: { id: categoryIds },
        });
        await article.setCategories(categories);
      }

      // Fetch updated categories for the response
      const updatedCategories = await article.getCategories({
        attributes: ['id', 'name'], // Specify the attributes you want
      });

      // Send back the updated article along with categoryIds
      res.json({
        ...article.get(), // Get the article attributes
        categoryIds: updatedCategories.map((cat) => cat.id), // Include category IDs
      });
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
      // Delete associated comments
      await Comment.destroy({ where: { articleId: id } });
      // Now delete the article
      await article.destroy();
      res.status(204).json({ message: 'Article Deleted Successfully' });
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
  } catch (error) {
    console.error('Error adding categories to article:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Search for articles by title
export const searchArticles = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { search } = req.query;

  if (!search || typeof search !== 'string') {
    res
      .status(400)
      .json({ error: 'Search query is required and must be a string' });
    return;
  }

  try {
    const articles = await Article.findAll({
      attributes: ['id', 'title'], // Only select id and title
      where: {
        title: {
          [Op.iLike]: `%${search}%`, // Use case-insensitive search
        },
      },
    });

    res.json({ articles });
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
