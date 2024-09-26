import { Request, Response } from 'express';
import { Category } from '../models/category';
import { Article } from '../models/article';
import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import User from '../models/user'; // Ensure you import the User model
import { Client } from '@elastic/elasticsearch'; // Adjust import based on your file structure
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

const client = new Client({
  node: 'http://localhost:9200', // Update with your Elasticsearch URL
  auth: {
    username: 'elastic', // Replace with your username
    password: '7zTXUDoF0UnWwdv1_elp', // Replace with your password
  },
});
// List all categories
export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'createdAt'],
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get a single category by ID with its articles

export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 10, search } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  if (pageNumber < 1 || limitNumber < 1) {
    return res
      .status(400)
      .json({ error: 'Page and limit must be positive numbers' });
  }

  try {
    // Fetch category to ensure it exists
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    let response: SearchResponse<any>;

    // Elasticsearch query to fetch articles by category ID
    const categoryFilter = { term: { categoryIds: id } }; // Assumes your Elasticsearch index has category IDs

    // If search query is provided, include it in the Elasticsearch query
    if (search && typeof search === 'string' && search.trim().length > 0) {
      response = await client.search({
        index: 'articles',
        body: {
          query: {
            bool: {
              must: [categoryFilter], // Ensure category match
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
      // If no search query, fetch articles only by category ID
      response = await client.search({
        index: 'articles',
        body: {
          query: {
            bool: {
              must: [categoryFilter], // Ensure category match
            },
          },
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

    // Return the category along with the articles and pagination info
    res.json({
      category: category.name,
      total,
      pages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
      articles,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
//get artilces with category id

// export const getCategoryById = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { id } = req.params; // Get category id from request params
//   const { page = 1, limit = 10 } = req.query; // Get page and limit from request
//   const pageNumber = parseInt(page as string, 10);
//   const limitNumber = parseInt(limit as string, 10);

//   if (pageNumber < 1 || limitNumber < 1) {
//     res.status(400).json({ error: 'Page and limit must be positive numbers' });
//     return;
//   }

//   try {
//     // Fetch category details
//     const category = await Category.findByPk(id);

//     if (!category) {
//       res.status(404).json({ message: 'Category not found' });
//       return;
//     }

//     // Build the search query
//     const query = {
//       index: 'articles',
//       body: {
//         query: {
//           term: {
//             categoryId: id, // Ensure this matches the field in your indexed documents
//           },
//         },
//         from: (pageNumber - 1) * limitNumber,
//         size: limitNumber,
//         sort: [{ createdAt: { order: 'desc' } }],
//         track_total_hits: true, // Ensure accurate total count
//       },
//     };

//     // Fetch articles associated with the category from Elasticsearch
//     const response: SearchResponse<any> = await client.search(query);

//     const totalHits = response.hits.total;

//     const articleCount = totalHits
//       ? typeof totalHits === 'number'
//         ? totalHits
//         : totalHits.value
//       : 0;

//     const articles = response.hits.hits.map((hit) => ({
//       id: hit._id,
//       title: hit._source.title,
//       description: hit._source.description,
//       thumbnailUrl: hit._source.thumbnailUrl,
//       createdAt: hit._source.createdAt,
//       author: { username: hit._source.username || 'Unknown' },
//     }));

//     res.json({
//       articleCount,
//       categoryName: category.name,
//       articles,
//       total: articleCount,
//       pages: Math.ceil(articleCount / limitNumber),
//       currentPage: pageNumber,
//     });
//   } catch (error) {
//     console.error('Error fetching articles by category ID:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// Create a new category
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }

  try {
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Update an existing category
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const category = await Category.findByPk(id);

    if (category) {
      category.name = name || category.name;
      await category.save();
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete a category
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id);

    if (category) {
      await category.destroy();
      res.status(204).send(); // No content
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
