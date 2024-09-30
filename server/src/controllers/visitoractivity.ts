// src/controllers/visitorActivityController.ts
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Article } from '../models/article';
import VisitorActivity from '../models/VisitorActivity';
import { Client } from '@elastic/elasticsearch'; // Assuming you have an Elasticsearch client setup
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import User from '../models/user';
import { Sequelize } from 'sequelize';
const client = new Client({
  node: 'http://localhost:9200', // Update with your Elasticsearch URL
  auth: {
    username: 'elastic', // Replace with your username
    password: '7zTXUDoF0UnWwdv1_elp', // Replace with your password
  },
});
// Helper function to get visitor's IP or identifier
const getVisitorId = (req: Request): string => {
  return (
    req.headers['x-forwarded-for']?.toString() ||
    req.socket.remoteAddress ||
    'unknown'
  );
};

// Create a new visitor activity
export const createVisitorActivity = async (req: Request, res: Response) => {
  try {
    const visitorId = getVisitorId(req); // Use helper to get visitor IP or ID

    // Merge the visitorId into the activity data from the request
    const activityData = {
      ...req.body,
      visitorId,
    };

    const activity = await VisitorActivity.create(activityData);
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error creating visitor activity', error });
  }
};

// Get all visitor activities
export const getVisitorActivities = async (req: Request, res: Response) => {
  try {
    const activities = await VisitorActivity.findAll();
    res.status(200).json(activities);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching visitor activities', error });
  }
};

// Get a single visitor activity by ID
export const getVisitorActivity = async (req: Request, res: Response) => {
  try {
    const activity = await VisitorActivity.findByPk(req.params.id);
    if (activity) {
      res.status(200).json(activity);
    } else {
      res.status(404).json({ message: 'Visitor activity not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visitor activity', error });
  }
};

// Update a visitor activity by ID
export const updateVisitorActivity = async (req: Request, res: Response) => {
  try {
    const [updated] = await VisitorActivity.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedActivity = await VisitorActivity.findByPk(req.params.id);
      res.status(200).json(updatedActivity);
    } else {
      res.status(404).json({ message: 'Visitor activity not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating visitor activity', error });
  }
};

// Delete a visitor activity by ID
export const deleteVisitorActivity = async (req: Request, res: Response) => {
  try {
    const deleted = await VisitorActivity.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Visitor activity not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting visitor activity', error });
  }
};
// export const getRecommendedArticlesForVisitor = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const visitorId = getVisitorId(req); // Get visitor ID from the IP address
//   const { page = 1, limit = 10, search } = req.query; // Pagination & Search Query

//   const pageNumber = parseInt(page as string, 10);
//   const limitNumber = parseInt(limit as string, 10);

//   if (pageNumber < 1 || limitNumber < 1) {
//     res.status(400).json({ error: 'Page and limit must be positive numbers' });
//     return;
//   }

//   try {
//     // Step 1: Fetch visitor activities sorted by view count (Sequelize)
//     const visitorActivities = await VisitorActivity.findAll({
//       where: { visitorId },
//       include: [{ model: Article, as: 'article' }],
//       order: [['viewCount', 'DESC']], // Sort by most views
//       limit: limitNumber,
//       offset: (pageNumber - 1) * limitNumber, // Pagination offset
//     });

//     const mostViewedArticles = visitorActivities.map(
//       (activity) => activity.articleId
//     );

//     // Step 2: Get the categories of the articles the visitor has viewed
//     const viewedCategoryIds = visitorActivities
//       .map((activity) => activity.categoryId)
//       .filter((id) => id != null);

//     // Step 3: Fetch recent articles in those categories using Elasticsearch
//     let response: SearchResponse<any>;

//     if (search && typeof search === 'string' && search.trim().length > 0) {
//       // If search query exists, search articles using Elasticsearch
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
//           track_total_hits: true, // Accurate total count
//         },
//       });
//     } else {
//       // Fetch recent articles in the visitor's viewed categories
//       response = await client.search({
//         index: 'articles',
//         body: {
//           query: {
//             terms: { categoryId: viewedCategoryIds },
//           },
//           from: (pageNumber - 1) * limitNumber,
//           size: limitNumber,
//           sort: [{ createdAt: { order: 'desc' } }],
//           track_total_hits: true, // Accurate total count
//         },
//       });
//     }

//     // Map Elasticsearch results to article objects
//     const recentArticles = response.hits.hits.map((hit) => ({
//       id: hit._id,
//       title: hit._source.title,
//       description: hit._source.description,
//       thumbnailUrl: hit._source.thumbnailUrl,
//       createdAt: hit._source.createdAt,
//       author: { username: hit._source.username || 'Unknown' }, // Include author
//     }));

//     // Safely handle total count
//     const total = response.hits.total
//       ? typeof response.hits.total === 'number'
//         ? response.hits.total
//         : response.hits.total.value
//       : 0; // Default to 0 if undefined

//     res.status(200).json({
//       total, // Total number of recent articles
//       pages: Math.ceil(total / limitNumber),
//       currentPage: pageNumber,
//       mostViewedArticles, // Articles sorted by view count
//       recentArticles, // Articles fetched by category and recency
//     });
//   } catch (error) {
//     console.error('Error fetching recommended articles:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const getRecommendedArticlesForVisitor = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const visitorId = getVisitorId(req); // Get visitor ID from the IP address
//   const { page = 1, limit = 10 } = req.query; // Pagination

//   const pageNumber = parseInt(page as string, 10);
//   const limitNumber = parseInt(limit as string, 10);

//   if (pageNumber < 1 || limitNumber < 1) {
//     res.status(400).json({ error: 'Page and limit must be positive numbers' });
//     return;
//   }

//   try {
//     // Step 1: Fetch visitor activities sorted by view count (Sequelize)
//     const visitorActivities = await VisitorActivity.findAll({
//       where: { visitorId },
//       order: [['viewCount', 'ASC']], // Sort by most views
//       limit: limitNumber,
//       offset: (pageNumber - 1) * limitNumber, // Pagination offset
//     });

//     // Step 2: Extract article IDs from visitor activities
//     const articleIds = visitorActivities.map((activity) => activity.articleId);

//     // Step 3: Fetch articles using the extracted IDs
//     const mostViewedArticles = await Article.findAll({
//       where: { id: articleIds },
//       include: [{ model: User, as: 'author', attributes: ['username'] }], // Include author username
//     });

//     // Step 4: Map the articles to the desired structure
//     const recommendedArticles = mostViewedArticles.map((article) => ({
//       id: article.id,
//       title: article.title,
//       description: article.description,
//       thumbnailUrl: article.thumbnailUrl,
//       createdAt: article.createdAt,
//       author: { username: article.author?.username || 'Unknown' }, // Include author
//     }));

//     // Step 5: Calculate total number of articles viewed by this visitor
//     const totalViews = await VisitorActivity.count({
//       where: { visitorId },
//     });

//     res.status(200).json({
//       total: totalViews, // Total number of articles viewed by this visitor
//       pages: Math.ceil(totalViews / limitNumber),
//       currentPage: pageNumber,
//       recommendedArticles, // Only the most viewed articles
//     });
//   } catch (error) {
//     console.error('Error fetching recommended articles:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
export const getRecommendedArticlesForVisitor = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { page = 1, limit = 10 } = req.query; // Pagination

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  if (pageNumber < 1 || limitNumber < 1) {
    res.status(400).json({ error: 'Page and limit must be positive numbers' });
    return;
  }

  try {
    // Step 1: Aggregate total view counts for each article
    const articleViewCounts = await VisitorActivity.findAll({
      attributes: [
        'articleId',
        [Sequelize.fn('SUM', Sequelize.col('viewCount')), 'totalViews'],
      ],
      group: ['articleId'],
      order: [[Sequelize.fn('SUM', Sequelize.col('viewCount')), 'DESC']],
      limit: limitNumber,
      offset: (pageNumber - 1) * limitNumber,
    });

    // Check if no articles are returned
    if (articleViewCounts.length === 0) {
      res.status(200).json({
        total: 0,
        pages: 0,
        currentPage: pageNumber,
        recommendedArticles: [], // Empty array indicates no articles
      });
      return;
    }

    // Extract article IDs from the result
    const articleIds = articleViewCounts.map((activity) => activity.articleId);

    // Fetch articles using the extracted IDs
    const mostViewedArticles = await Article.findAll({
      where: { id: articleIds },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['username'],
        },
      ],
    });

    const recommendedArticles = mostViewedArticles.map((article) => ({
      id: article.id,
      title: article.title,
      description: article.description,
      thumbnailUrl: article.thumbnailUrl,
      createdAt: article.createdAt,
      author: { username: article.author?.username || 'Unknown' },
    }));

    // Count total number of distinct articles
    const totalViewedArticles = await VisitorActivity.count({
      distinct: true,
      col: 'articleId',
    });

    const totalPages = Math.ceil(totalViewedArticles / limitNumber);

    res.status(200).json({
      total: totalViewedArticles,
      pages: totalPages,
      currentPage: pageNumber,
      recommendedArticles,
    });
  } catch (error) {
    console.error('Error fetching recommended articles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
