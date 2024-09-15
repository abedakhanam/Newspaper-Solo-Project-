import { Request, Response } from 'express';
import Category from '../models/category';

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
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id, {
      attributes: ['id', 'name', 'createdAt'],
    });

    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
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
