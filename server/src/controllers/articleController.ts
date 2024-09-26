// import { Request, Response } from 'express';
// import { Article, ArticleCreationAttributes } from '../models/article';
// import Comment from '../models/comment'; // Import Comment model
// import { Category } from '../models/category';
// import User from '../models/user';
// import { Op, Sequelize } from 'sequelize';

// // Get all the articles
// export const getArticles = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { page = 1, limit = 10 } = req.query;

//   // Convert page and limit to numbers
//   const pageNumber = parseInt(page as string, 10);
//   const limitNumber = parseInt(limit as string, 10);

//   // Ensure valid pagination values
//   if (pageNumber < 1 || limitNumber < 1) {
//     res.status(400).json({ error: 'Page and limit must be positive numbers' });
//     return;
//   }

//   try {
//     const offset = (pageNumber - 1) * limitNumber;
//     const { count, rows } = await Article.findAndCountAll({
//       attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'],
//       include: [
//         {
//           model: User,
//           attributes: ['username'], // Include the author's username
//           as: 'author', // Ensure this matches the alias defined in associations
//         },
//       ],
//       limit: limitNumber,
//       offset: offset,
//       order: [['createdAt', 'DESC']], // Sort by createdAt in descending order
//     });

//     res.json({
//       total: count,
//       pages: Math.ceil(count / limitNumber),
//       currentPage: pageNumber,
//       articles: rows,
//     });
//   } catch (error) {
//     console.error('Error fetching articles:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// export const getArticlesByUserId = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const userId = req.user?.id;
//   const { page = 1, limit = 10 } = req.query;

//   if (!userId) {
//     res.status(401).json({ error: 'Unauthorized' });
//     return;
//   }

//   const pageNumber = parseInt(page as string, 10);
//   const limitNumber = parseInt(limit as string, 10);

//   if (pageNumber < 1 || limitNumber < 1) {
//     res.status(400).json({ error: 'Page and limit must be positive numbers' });
//     return;
//   }

//   try {
//     const offset = (pageNumber - 1) * limitNumber;
//     const { count, rows } = await Article.findAndCountAll({
//       attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'],
//       where: { authorId: userId },
//       limit: limitNumber,
//       offset: offset,
//       order: [['createdAt', 'DESC']],
//       include: [
//         {
//           model: User,
//           attributes: ['username'], // Include the author's username
//           as: 'author', // Ensure this matches the alias defined in associations
//         },
//       ],
//     });

//     res.json({
//       total: count,
//       pages: Math.ceil(count / limitNumber),
//       currentPage: pageNumber,
//       articles: rows,
//     });
//   } catch (error) {
//     console.error('Error fetching articles:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Get a single article by ID
// export const getArticleById = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { id } = req.params;

//   try {
//     // Fetch the article along with the author, comments, and categories
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

//     // Fetch related articles based on categories, excluding the current article
//     const relatedArticles = await Article.findAll({
//       include: [
//         {
//           model: User,
//           as: 'author',
//           attributes: ['username'],
//         },
//       ],
//       where: {
//         id: { [Op.ne]: id }, // Exclude the current article
//       },
//       attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'],
//       limit: 5,
//     });

//     // Prepare the response
//     res.status(200).json({
//       article: {
//         ...article.get(), // Use get() to convert Sequelize instance to plain object
//         categories: article.categories, // Include categories in the article response
//       },
//       relatedArticles,
//     });
//   } catch (error) {
//     console.error('Error fetching article:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// //Create a new article

// export const createArticle = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { title, description, content, categoryIds } = req.body;

//   // Set thumbnailUrl to the uploaded file's path or use a default URL
//   const thumbnailUrl = req.file
//     ? `/uploads/${req.file.filename}`
//     : req.body.thumbnailUrl;

//   try {
//     if (!req.user || !req.user.id) {
//       res.status(401).json({ error: 'Unauthorized' });
//       return;
//     }

//     const authorId = req.user.id;

//     const article = await Article.create({
//       title,
//       description,
//       content,
//       thumbnailUrl, // Save thumbnailUrl
//       authorId,
//     } as ArticleCreationAttributes);

//     // If category IDs are provided, associate them with the article
//     if (categoryIds && categoryIds.length > 0) {
//       const categories = await Category.findAll({
//         where: {
//           id: categoryIds,
//         },
//       });
//       await article.setCategories(categories);
//     }

//     // Fetch the associated categories for the response
//     const associatedCategories = await article.getCategories({
//       attributes: ['id', 'name'], // Specify the attributes you want
//     });

//     // Send back the created article along with category IDs
//     res.status(201).json({
//       article,
//       categoryIds: associatedCategories.map((cat) => cat.id), // Include category IDs
//     });
//   } catch (error) {
//     console.error('Error creating article:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Update an existing article
// export const updateArticle = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { id } = req.params;
//   const { title, description, content, categoryIds } = req.body; // Ensure categoryIds is included

//   // Handle uploaded thumbnail file
//   const uploadedThumbnailUrl = req.file
//     ? `/uploads/${req.file.filename}`
//     : undefined;

//   try {
//     if (!req.user || !req.user.id) {
//       res.status(401).json({ error: 'Unauthorized' });
//       return;
//     }

//     const article = await Article.findByPk(id);

//     if (article && article.authorId === req.user.id) {
//       // Update the article's attributes
//       article.title = title || article.title;
//       article.description = description || article.description;
//       article.content = content || article.content;

//       // Update thumbnailUrl based on uploaded file or provided URL
//       if (uploadedThumbnailUrl) {
//         article.thumbnailUrl = uploadedThumbnailUrl;
//       }

//       await article.save();

//       // Update categories if provided
//       if (categoryIds && categoryIds.length > 0) {
//         const categories = await Category.findAll({
//           where: { id: categoryIds },
//         });
//         await article.setCategories(categories);
//       }

//       // Fetch updated categories for the response
//       const updatedCategories = await article.getCategories({
//         attributes: ['id', 'name'], // Specify the attributes you want
//       });

//       // Send back the updated article along with categoryIds
//       res.json({
//         ...article.get(), // Get the article attributes
//         categoryIds: updatedCategories.map((cat) => cat.id), // Include category IDs
//       });
//     } else {
//       res.status(403).json({ error: 'Forbidden' });
//     }
//   } catch (error) {
//     console.error('Error updating article:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Delete an article if the user is authorized
// export const deleteArticle = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { id } = req.params;

//   try {
//     if (!req.user || !req.user.id) {
//       res.status(401).json({ error: 'Unauthorized' });
//       return;
//     }

//     const article = await Article.findByPk(id);

//     if (article && article.authorId === req.user.id) {
//       // Delete associated comments
//       await Comment.destroy({ where: { articleId: id } });
//       // Now delete the article
//       await article.destroy();
//       res.status(204).json({ message: 'Article Deleted Successfully' });
//     } else {
//       res.status(403).json({ error: 'Forbidden' });
//     }
//   } catch (error) {
//     console.error('Error deleting article:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Add categories to an existing article
// export const addCategoriesToArticle = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const articleId = req.params.id; // Get articleId from URL parameters
//   const { categoryIds } = req.body; // Get categoryIds from the request body

//   try {
//     // Find the article
//     const article = await Article.findByPk(articleId);

//     if (!article) {
//       res.status(404).json({ error: 'Article not found' });
//       return;
//     }

//     // Find categories and associate them with the article
//     const categories = await Category.findAll({
//       where: {
//         id: categoryIds,
//       },
//     });

//     if (categories.length !== categoryIds.length) {
//       res.status(404).json({ error: 'Some categories not found' });
//       return;
//     }

//     await article.setCategories(categories);

//     res
//       .status(200)
//       .json({ message: 'Categories added to article successfully' });
//   } catch (error) {
//     console.error('Error adding categories to article:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// // Search for articles by title
// export const searchArticles = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { search } = req.query;

//   if (!search || typeof search !== 'string') {
//     res
//       .status(400)
//       .json({ error: 'Search query is required and must be a string' });
//     return;
//   }

//   try {
//     const articles = await Article.findAll({
//       attributes: ['id', 'title'], // Only select id and title
//       where: {
//         title: {
//           [Op.iLike]: `%${search}%`, // Use case-insensitive search
//         },
//       },
//     });

//     res.json({ articles });
//   } catch (error) {
//     console.error('Error searching articles:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

import { Request, Response } from 'express';
import { Article, ArticleCreationAttributes } from '../models/article';
import Comment from '../models/comment';
import { Category } from '../models/category';
import User from '../models/user';
import { Op, Sequelize } from 'sequelize';
import { Client } from '@elastic/elasticsearch'; // Import Elasticsearch Client
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types'; // Import SearchResponse type
import { io } from '../../index';
import VisitorActivity from '../models/VisitorActivity';
// Initialize your Elasticsearch client
const client = new Client({
  node: 'http://localhost:9200', // Update with your Elasticsearch URL
  auth: {
    username: 'elastic', // Replace with your username
    password: '7zTXUDoF0UnWwdv1_elp', // Replace with your password
  },
}); // Update the URL if needed

// Get all the articles
// export const getArticles = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { page = 1, limit = 10 } = req.query;

//   const pageNumber = parseInt(page as string, 10);
//   const limitNumber = parseInt(limit as string, 10);

//   if (pageNumber < 1 || limitNumber < 1) {
//     res.status(400).json({ error: 'Page and limit must be positive numbers' });
//     return;
//   }

//   try {
//     const offset = (pageNumber - 1) * limitNumber;
//     const { count, rows } = await Article.findAndCountAll({
//       attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'],
//       include: [
//         {
//           model: User,
//           attributes: ['username'],
//           as: 'author',
//         },
//       ],
//       limit: limitNumber,
//       offset: offset,
//       order: [['createdAt', 'DESC']],
//     });

//     res.json({
//       total: count,
//       pages: Math.ceil(count / limitNumber),
//       currentPage: pageNumber,
//       articles: rows,
//     });
//   } catch (error) {
//     console.error('Error fetching articles:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // // Search for articles by title using Elasticsearch
// export const searchArticles = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { search } = req.query;

//   if (!search || typeof search !== 'string') {
//     res
//       .status(400)
//       .json({ error: 'Search query is required and must be a string' });
//     return;
//   }

//   try {
//     const response: SearchResponse<any> = await client.search({
//       index: 'articles', // Ensure this matches your index name
//       body: {
//         query: {
//           bool: {
//             should: [
//               {
//                 match_phrase_prefix: {
//                   title: search, // Match on the title field
//                 },
//               },
//               {
//                 match_phrase_prefix: {
//                   description: search, // Match on the description field
//                 },
//               },
//             ],
//           },
//         },
//       },
//     });

//     const articles = response.hits.hits.map((hit) => ({
//       id: hit._id,
//       title: hit._source.title,
//       description: hit._source.description,
//     }));

//     res.json({ articles });
//   } catch (error) {
//     console.error('Error searching articles:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
// export const getArticles = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { page = 1, limit = 10, search } = req.query;

//   const pageNumber = parseInt(page as string, 10);
//   const limitNumber = parseInt(limit as string, 10);

//   if (pageNumber < 1 || limitNumber < 1) {
//     res.status(400).json({ error: 'Page and limit must be positive numbers' });
//     return;
//   }

//   try {
//     // If search query is provided, use Elasticsearch
//     if (search && typeof search === 'string' && search.trim().length > 0) {
//       const response: SearchResponse<any> = await client.search({
//         index: 'articles',
//         body: {
//           query: {
//             bool: {
//               should: [
//                 {
//                   match_phrase_prefix: {
//                     title: search,
//                   },
//                 },
//                 {
//                   match_phrase_prefix: {
//                     description: search,
//                   },
//                 },
//               ],
//             },
//           },
//         },
//       });

//       const articles = response.hits.hits.map((hit) => ({
//         id: hit._id,
//         title: hit._source.title,
//         description: hit._source.description,
//         thumbnailUrl: hit._source.thumbnailUrl,
//         createdAt: hit._source.createdAt,
//       }));

//       res.json({ articles });
//       return;
//     }

//     // If no search query, fetch all articles
//     const offset = (pageNumber - 1) * limitNumber;
//     const { count, rows } = await Article.findAndCountAll({
//       attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'],
//       include: [
//         {
//           model: User,
//           attributes: ['username'],
//           as: 'author',
//         },
//       ],
//       limit: limitNumber,
//       offset: offset,
//       order: [['createdAt', 'DESC']],
//     });

//     res.json({
//       total: count,
//       pages: Math.ceil(count / limitNumber),
//       currentPage: pageNumber,
//       articles: rows,
//     });
//   } catch (error) {
//     console.error('Error fetching articles:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }; final get search merged controller

// Other controller methods remain unchanged...

interface ArticleSource {
  title: string;
  description: string;
  thumbnailUrl: string;
  createdAt: string;
  username?: string; // optional if not always included
}

// export const getArticles = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { page = 1, limit = 10, search } = req.query;

//   const pageNumber = parseInt(page as string, 10);
//   const limitNumber = parseInt(limit as string, 10);

//   if (pageNumber < 1 || limitNumber < 1) {
//     res.status(400).json({ error: 'Page and limit must be positive numbers' });
//     return;
//   }

//   try {
//     // If search query is provided, use Elasticsearch
//     if (search && typeof search === 'string' && search.trim().length > 0) {
//       const response = await client.search({
//         index: 'articles',
//         body: {
//           query: {
//             bool: {
//               should: [
//                 { match_phrase_prefix: { title: search } },
//                 { match_phrase_prefix: { description: search } },
//               ],
//             },
//           },
//         },
//       });

//       const articles = response.hits.hits.map((hit) => {
//         const source = hit._source as ArticleSource;
//         return {
//           id: hit._id,
//           title: source.title,
//           description: source.description,
//           thumbnailUrl: source.thumbnailUrl,
//           createdAt: source.createdAt,
//           author: { username: source.username || 'Unknown' }, // Include username from Elasticsearch
//         };
//       });

//       res.json({ articles });
//       return;
//     }

//     // If no search query, fetch all articles from PostgreSQL
//     const offset = (pageNumber - 1) * limitNumber;
//     const { count, rows } = await Article.findAndCountAll({
//       attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'],
//       include: [
//         {
//           model: User,
//           attributes: ['username'],
//           as: 'author',
//         },
//       ],
//       limit: limitNumber,
//       offset: offset,
//       order: [['createdAt', 'DESC']],
//     });

//     const articles = rows.map((article) => ({
//       id: article.id,
//       title: article.title,
//       description: article.description,
//       thumbnailUrl: article.thumbnailUrl,
//       createdAt: article.createdAt,
//       author: { username: article.author?.username || 'Unknown' }, // Include username from PostgreSQL
//     }));

//     res.json({
//       total: count,
//       pages: Math.ceil(count / limitNumber),
//       currentPage: pageNumber,
//       articles,
//     });
//   } catch (error) {
//     console.error('Error fetching articles:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

export const getArticles = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { page = 1, limit = 10, search } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  if (pageNumber < 1 || limitNumber < 1) {
    res.status(400).json({ error: 'Page and limit must be positive numbers' });
    return;
  }

  try {
    let response: SearchResponse<any>;

    // If search query is provided, use Elasticsearch with sorting
    if (search && typeof search === 'string' && search.trim().length > 0) {
      response = await client.search({
        index: 'articles',
        body: {
          query: {
            bool: {
              should: [
                { match_phrase_prefix: { title: search } },
                { match_phrase_prefix: { description: search } },
              ],
            },
          },
          from: (pageNumber - 1) * limitNumber,
          size: limitNumber,
          sort: [{ createdAt: { order: 'desc' } }],
          track_total_hits: true, // Ensure accurate total count
        },
      });
    } else {
      // If no search query, fetch a default number of articles from Elasticsearch
      response = await client.search({
        index: 'articles',
        body: {
          from: (pageNumber - 1) * limitNumber,
          size: limitNumber,
          sort: [{ createdAt: { order: 'desc' } }],
          track_total_hits: true, // Ensure accurate total count
        },
      });
    }

    const articles = response.hits.hits.map((hit) => ({
      id: hit._id,
      title: hit._source.title,
      description: hit._source.description,
      thumbnailUrl: hit._source.thumbnailUrl,
      createdAt: hit._source.createdAt,
      author: { username: hit._source.username || 'Unknown' }, // Include username
    }));

    // Safely handle total count
    const total = response.hits.total
      ? typeof response.hits.total === 'number'
        ? response.hits.total
        : response.hits.total.value
      : 0; // Default to 0 if total is undefined

    res.json({
      total,
      pages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
      articles,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//get article by user id for my articles
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
          attributes: ['username'],
          as: 'author',
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

export const getArticleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    // Fetch the article along with its related information
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
              attributes: ['username'],
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

    // Log visitor activity
    const visitorId = req.ip || 'unknown';
    const articleId = Number(id); // Convert string ID to a number

    // Prepare the data to create or update a VisitorActivity
    const activityData = {
      visitorId, // Log visitor ID (IP address or session ID)
      articleId, // This should be a number
      categoryId:
        article.categories && article.categories.length > 0
          ? article.categories[0].id
          : undefined,
    };

    // Create a new VisitorActivity or update if it already exists
    await VisitorActivity.upsert(activityData); // Use upsert to handle both create and update

    // Count how many times the article has been clicked
    const clickCount = await VisitorActivity.count({
      where: {
        articleId,
      },
    });

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

    res.status(200).json({
      article: {
        ...article.get(),
        categories: article.categories,
        clickCount, // Add click count to the response
      },
      relatedArticles,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
//only details
//
//
//

// export const getArticleById = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { id } = req.params;

//   try {
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
//               attributes: ['username'],
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

//     res.status(200).json({
//       article: {
//         ...article.get(),
//         categories: article.categories,
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching article:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
// export const getRelatedArticles = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { id } = req.params;

//   try {
//     const article = await Article.findOne({
//       where: { id },
//       include: [
//         {
//           model: Category,
//           as: 'categories',
//           attributes: ['id', 'name'],
//         },
//       ],
//     });

//     if (!article || !article.categories || article.categories.length === 0) {
//       res.status(404).json({ error: 'Article or its categories not found' });
//       return;
//     }

//     const categoryIds = article.categories.map((cat) => cat.id);

//     const relatedArticles = await Article.findAll({
//       include: [
//         {
//           model: User,
//           as: 'author',
//           attributes: ['username'],
//         },
//         {
//           model: Category,
//           as: 'categories',
//           attributes: [],
//           where: {
//             id: categoryIds, // Ensures the category filter
//           },
//         },
//       ],
//       where: {
//         id: { [Op.ne]: id }, // Exclude the current article
//       },
//       attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'],
//       limit: 5,
//     });

//     res.status(200).json({ relatedArticles });
//   } catch (error) {
//     console.error('Error fetching related articles:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
//
//
//
//

// Create a new article
// Ensure this is where your Elasticsearch client is initialized

export const createArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { title, description, content, categoryIds } = req.body;

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
      thumbnailUrl,
      authorId,
    });

    await client.index({
      index: 'articles',
      id: article.id.toString(),
      body: {
        title,
        description,
        content,
        category: categoryIds || [],
        thumbnailUrl,
        createdAt: article.createdAt,
        username: req.user.username, // Include username for future reference
      },
    });

    if (categoryIds && categoryIds.length > 0) {
      const categories = await Category.findAll({
        where: { id: categoryIds },
      });
      await article.setCategories(categories);
    }

    const associatedCategories = await article.getCategories({
      attributes: ['id', 'name'],
    });

    // Emit event to notify clients
    io.emit('articleCreated', article);

    res.status(201).json({
      article,
      categoryIds: associatedCategories.map((cat) => cat.id),
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
  const { title, description, content, categoryIds } = req.body;
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
      article.title = title || article.title;
      article.description = description || article.description;
      article.content = content || article.content;

      if (uploadedThumbnailUrl) {
        article.thumbnailUrl = uploadedThumbnailUrl;
      }

      await article.save();

      if (categoryIds && categoryIds.length > 0) {
        const categories = await Category.findAll({
          where: { id: categoryIds },
        });
        await article.setCategories(categories);
      }

      const updatedCategories = await article.getCategories({
        attributes: ['id', 'name'],
      });

      // Update the article in Elasticsearch
      await client.update({
        index: 'articles',
        id: id.toString(),
        body: {
          doc: {
            title: article.title,
            description: article.description,
            content: article.content,
            thumbnailUrl: article.thumbnailUrl,
            categoryIds: categoryIds || [],
            updatedAt: new Date().toISOString(), // Update the timestamp in Elasticsearch
          },
        },
      });

      // Emit event to notify clients
      io.emit('articleUpdated', article);

      res.json({
        ...article.get(),
        categoryIds: updatedCategories.map((cat) => cat.id),
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
      await Comment.destroy({ where: { articleId: id } }); // Optionally remove comments
      await article.destroy();

      // Remove the article from Elasticsearch
      await client.delete({
        index: 'articles',
        id: id.toString(),
      });

      // Emit event to notify clients
      io.emit('articleDeleted', id);

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
  const articleId = req.params.id;
  const { categoryIds } = req.body;

  try {
    const article = await Article.findByPk(articleId);

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

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
