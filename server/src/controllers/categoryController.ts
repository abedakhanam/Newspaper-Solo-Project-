import { Request, Response } from 'express';
import { Category } from '../models/category';
import { Article } from '../models/article';
import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import User from '../models/user'; // Ensure you import the User model

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

// export const getCategoryById = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { id } = req.params; // Get category id from request params

//   try {
//     // Fetch the category by ID, including the associated articles
//     const category = await Category.findByPk(id, {
//       include: [
//         {
//           model: Article,
//           through: { attributes: [] }, // Exclude through table attributes
//           attributes: [
//             'id',
//             'title',
//             'description',
//             'thumbnailUrl',
//             'createdAt',
//           ], // Include id, title, description, thumbnailUrl, and createdAt
//           include: [
//             {
//               model: User,
//               as: 'author', // Use the alias for the User model
//               attributes: ['username'], // Include only the username
//             },
//           ],
//         },
//       ],
//     });

//     if (category) {
//       // Count the number of articles associated with the category
//       const articleCount = await Article.count({
//         include: [
//           {
//             model: Category,
//             through: { attributes: [] }, // Exclude join table attributes
//             where: { id }, // Use the category ID to filter articles
//           },
//         ],
//       });

//       // Return the category details and article count
//       res.json({
//         category,
//         articleCount,
//       });
//     } else {
//       res.status(404).json({ message: 'Category not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching category:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

//get artilces with category id

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
          model: Article,
          as: 'articles', // Use the alias defined in the association
          through: { attributes: [] }, // Exclude through table attributes
          attributes: [
            'id',
            'title',
            'description',
            'thumbnailUrl',
            'createdAt',
          ], // Include id, title, description, thumbnailUrl, and createdAt
          include: [
            {
              model: User,
              as: 'author', // Use the alias for the User model
              attributes: ['username'], // Include only the username
            },
          ],
        },
      ],
    });

    if (category) {
      // Count the number of articles associated with the category
      const articleCount = await Article.count({
        include: [
          {
            model: Category,
            as: 'categories', // Use the alias for the reverse association
            through: { attributes: [] }, // Exclude join table attributes
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

export default getCategoryById;

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
