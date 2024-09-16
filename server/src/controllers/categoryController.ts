import { Request, Response } from 'express';
import { Category } from '../models/category';
import { Article } from '../models/article';
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

// Get a single category by ID
// Get a single category by ID with its articles and count
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params; // Get category id from request params

  try {
    // Fetch the category by ID, including the associated articles
    const category = await Category.findByPk(id, {
      include: [
        {
          model: Article, // Include associated articles
          through: { attributes: [] }, // Exclude through table attributes (if using many-to-many)
          attributes: ['id', 'title', 'content'], // Choose what fields to include from the article
        },
      ],
    });

    if (category) {
      // Count the number of articles associated with the category
      const articleCount = await Article.count({
        include: [
          {
            model: Category,
            where: { id }, // Use the category ID to filter articles
          },
        ],
      });

      // Return the category details and article count
      res.json({
        category,
        articleCount,
      });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
    const category = await Category.create({
      name,
    });

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
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
