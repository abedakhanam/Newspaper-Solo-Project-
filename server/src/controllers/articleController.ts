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
});
interface ArticleSource {
  title: string;
  description: string;
  thumbnailUrl: string;
  createdAt: string;
  username?: string; // optional if not always included
}

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

// // // // Search for articles by title using Elasticsearch
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
// };

// Other controller methods remain unchanged...

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
    // If search query is provided, use Elasticsearch
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const response = await client.search({
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
        },
      });

      const articles = response.hits.hits.map((hit) => {
        const source = hit._source as ArticleSource;
        return {
          id: hit._id,
          title: source.title,
          description: source.description,
          thumbnailUrl: source.thumbnailUrl,
          createdAt: source.createdAt,
          author: { username: source.username || 'Unknown' }, // Include username from Elasticsearch
        };
      });

      res.json({ articles });
      return;
    }

    // If no search query, fetch all articles from PostgreSQL
    const offset = (pageNumber - 1) * limitNumber;
    const { count, rows } = await Article.findAndCountAll({
      attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'],
      include: [
        {
          model: User,
          attributes: ['username'],
          as: 'author',
        },
      ],
      limit: limitNumber,
      offset: offset,
      order: [['createdAt', 'DESC']],
    });

    const articles = rows.map((article) => ({
      id: article.id,
      title: article.title,
      description: article.description,
      thumbnailUrl: article.thumbnailUrl,
      createdAt: article.createdAt,
      author: { username: article.author?.username || 'Unknown' }, // Include username from PostgreSQL
    }));

    res.json({
      total: count,
      pages: Math.ceil(count / limitNumber),
      currentPage: pageNumber,
      articles,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
//

// Define the View type here
type View = {
  userId: string; // Assuming userId is a string
  viewCount: number; // Assuming viewCount is a number
  lastViewedAt?: Date; // Optional if it exists
};

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
//     let response: SearchResponse<any>;

//     // If search query is provided, use Elasticsearch with sorting
//     if (search && typeof search === 'string' && search.trim().length > 0) {
//       response = await client.search({
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
//           from: (pageNumber - 1) * limitNumber,
//           size: limitNumber,
//           sort: [{ createdAt: { order: 'desc' } }],
//           track_total_hits: true, // Ensure accurate total count
//         },
//       });
//     } else {
//       // If no search query, fetch a default number of articles from Elasticsearch
//       response = await client.search({
//         index: 'articles',
//         body: {
//           from: (pageNumber - 1) * limitNumber,
//           size: limitNumber,
//           sort: [{ createdAt: { order: 'desc' } }],
//           track_total_hits: true, // Ensure accurate total count
//         },
//       });
//     }

//     // Process articles and fetch missing usernames from the database if necessary
//     const articles = await Promise.all(
//       response.hits.hits.map(async (hit) => {
//         let username = hit._source.username || 'Unknown';
//         let viewCount = 0;

//         // Ensure views are treated as an array of View type
//         const views: View[] = hit._source.views || []; // Default to empty array if views is undefined

//         // Calculate total view count from nested views
//         viewCount = views.reduce<number>(
//           (total, view) => total + view.viewCount,
//           0
//         );

//         // Fetch the username from the database if missing
//         if (username === 'Unknown' && hit._id) {
//           const article = await Article.findByPk(hit._id, {
//             include: [{ model: User, as: 'author', attributes: ['username'] }],
//           });
//           if (article && article.author) {
//             username = article.author.username;
//           }
//         }

//         return {
//           id: hit._id,
//           title: hit._source.title,
//           description: hit._source.description,
//           thumbnailUrl: hit._source.thumbnailUrl,
//           createdAt: hit._source.createdAt,
//           author: { username },
//           viewCount, // Include view count
//         };
//       })
//     );

//     // Safely handle total count
//     const total = response.hits.total
//       ? typeof response.hits.total === 'number'
//         ? response.hits.total
//         : response.hits.total.value
//       : 0; // Default to 0 if total is undefined

//     res.json({
//       total,
//       pages: Math.ceil(total / limitNumber),
//       currentPage: pageNumber,
//       articles,
//     });
//   } catch (error) {
//     console.error('Error fetching articles:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

//
//

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
//     let response: SearchResponse<any>;

//     // If search query is provided, use Elasticsearch with sorting
//     if (search && typeof search === 'string' && search.trim().length > 0) {
//       response = await client.search({
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
//           from: (pageNumber - 1) * limitNumber,
//           size: limitNumber,
//           sort: [{ createdAt: { order: 'desc' } }],
//           track_total_hits: true, // Ensure accurate total count
//         },
//       });
//     } else {
//       // If no search query, fetch a default number of articles from Elasticsearch
//       response = await client.search({
//         index: 'articles',
//         body: {
//           from: (pageNumber - 1) * limitNumber,
//           size: limitNumber,
//           sort: [{ createdAt: { order: 'desc' } }],
//           track_total_hits: true, // Ensure accurate total count
//         },
//       });
//     }

//     // Process articles and fetch missing usernames from the database if necessary
//     const articles = await Promise.all(
//       response.hits.hits.map(async (hit) => {
//         let username = hit._source.username || 'Unknown';

//         // Fetch the username from the database if missing
//         if (username === 'Unknown' && hit._id) {
//           const article = await Article.findByPk(hit._id, {
//             include: [{ model: User, as: 'author', attributes: ['username'] }],
//           });
//           if (article && article.author) {
//             username = article.author.username;
//           }
//         }

//         return {
//           id: hit._id,
//           title: hit._source.title,
//           description: hit._source.description,
//           thumbnailUrl: hit._source.thumbnailUrl,
//           createdAt: hit._source.createdAt,
//           author: { username },
//         };
//       })
//     );

//     // Safely handle total count
//     const total = response.hits.total
//       ? typeof response.hits.total === 'number'
//         ? response.hits.total
//         : response.hits.total.value
//       : 0; // Default to 0 if total is undefined

//     res.json({
//       total,
//       pages: Math.ceil(total / limitNumber),
//       currentPage: pageNumber,
//       articles,
//     });
//   } catch (error) {
//     console.error('Error fetching articles:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

//get article by user id for my articles

//
//

export const getArticlesByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const { page = 1, limit = 10, search } = req.query;

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
    let response: SearchResponse<any>;

    // If search query is provided, filter by search query
    if (search && typeof search === 'string' && search.trim().length > 0) {
      response = await client.search({
        index: 'articles',
        body: {
          query: {
            bool: {
              must: [
                { term: { authorId: userId } }, // Filter by user ID
                {
                  bool: {
                    should: [
                      { match_phrase_prefix: { title: search } },
                      { match_phrase_prefix: { description: search } },
                    ],
                  },
                },
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
      // If no search query, just filter by the user's articles
      response = await client.search({
        index: 'articles',
        body: {
          query: {
            term: { authorId: userId }, // Filter by user ID
          },
          from: (pageNumber - 1) * limitNumber,
          size: limitNumber,
          sort: [{ createdAt: { order: 'desc' } }],
          track_total_hits: true, // Ensure accurate total count
        },
      });
    }

    // Process the Elasticsearch hits and fetch usernames from the database if necessary
    const articles = await Promise.all(
      response.hits.hits.map(async (hit) => {
        const article = hit._source as ArticleSource; // Cast to ArticleSource

        // Attempt to fetch the username directly
        let username = article.username || 'Unknown';

        // If username is still unknown, fetch from the database
        if (username === 'Unknown') {
          const articleFromDb = await Article.findByPk(hit._id, {
            include: [{ model: User, as: 'author', attributes: ['username'] }],
          });
          if (articleFromDb && articleFromDb.author) {
            username = articleFromDb.author.username;
          }
        }

        return {
          id: hit._id,
          title: article.title,
          description: article.description,
          thumbnailUrl: article.thumbnailUrl,
          createdAt: article.createdAt,
          author: { username }, // Return the username
        };
      })
    );

    // Safely handle total count
    const total = response.hits.total
      ? typeof response.hits.total === 'number'
        ? response.hits.total
        : response.hits.total.value
      : 0; // Default to 0 if total is undefined

    // Send the response
    res.json({
      total,
      pages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
      articles,
    });
  } catch (error) {
    console.error('Error fetching user articles:', error);
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
//     // Fetch the article along with its related information
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

//     // Log visitor activity
//     const visitorId = req.ip || 'unknown';
//     const articleId = Number(id); // Convert string ID to a number

//     // Find or create a VisitorActivity record for this visitor and article
//     const [activity, created] = await VisitorActivity.findOrCreate({
//       where: { visitorId, articleId },
//       defaults: {
//         visitorId,
//         articleId,
//         categoryId:
//           article.categories && article.categories.length > 0
//             ? article.categories[0].id
//             : undefined,
//         viewCount: 1, // Set initial view count to 1 for new record
//         lastViewedAt: new Date(), // Set initial view time
//       },
//     });

//     if (!created) {
//       // If the record already exists, increment the viewCount and update the lastViewedAt
//       await activity.update({
//         viewCount: activity.viewCount + 1,
//         lastViewedAt: new Date(),
//       });
//     }

//     // Count how many times the article has been viewed by all visitors
//     const clickCount = await VisitorActivity.sum('viewCount', {
//       where: { articleId },
//     });

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

//     res.status(200).json({
//       article: {
//         ...article.get(),
//         categories: article.categories,
//         clickCount, // Total view count for the article
//       },
//       relatedArticles,
//     });
//   } catch (error) {
//     console.error('Error fetching article:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// }; postgresclickcount
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

    // Find or create a VisitorActivity record for this visitor and article
    const [activity, created] = await VisitorActivity.findOrCreate({
      where: { visitorId, articleId },
      defaults: {
        visitorId,
        articleId,
        categoryId:
          article.categories && article.categories.length > 0
            ? article.categories[0].id
            : undefined,
        viewCount: 1, // Set initial view count to 1 for new record
        lastViewedAt: new Date(), // Set initial view time
      },
    });

    if (!created) {
      // If the record already exists, increment the viewCount and update the lastViewedAt
      await activity.update({
        viewCount: activity.viewCount + 1,
        lastViewedAt: new Date(),
      });
    }

    // Increment the view count in Elasticsearch
    try {
      await client.update({
        index: 'articles',
        id: String(articleId),
        body: {
          script: {
            source: `
              boolean userExists = false;
              for (int i = 0; i < ctx._source.views.size(); i++) {
                if (ctx._source.views[i].userId == params.userId) {
                  ctx._source.views[i].viewCount += 1;
                  ctx._source.views[i].lastViewedAt = params.lastViewedAt;
                  userExists = true;
                  break; // Exit the loop once the user is found
                }
              }
              if (!userExists) {
                ctx._source.views.add(['userId': params.userId, 'viewCount': 1, 'lastViewedAt': params.lastViewedAt]);
              }
            `,
            params: {
              userId: visitorId,
              lastViewedAt: new Date().toISOString(),
            },
          },
        },
      });
    } catch (updateError) {
      console.error('Error updating Elasticsearch:', updateError);
      // Handle the error (e.g., log it or send a notification)
    }

    // Count how many times the article has been viewed by all visitors
    const clickCount = await VisitorActivity.sum('viewCount', {
      where: { articleId },
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
        clickCount, // Total view count for the article
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
        username: req.user.username,
        authorId, // Include username for future reference
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
