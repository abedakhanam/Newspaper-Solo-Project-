import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';

const router = Router();

// Route to get all categories
router.get('/categories', getCategories);

// Route to get a single category by ID
router.get('/categories/:id', getCategoryById);

// Route to create a new category
router.post('/categories', createCategory);

// Route to update a category by ID
router.put('/categories/:id', updateCategory);

// Route to delete a category by ID
router.delete('/categories/:id', deleteCategory);

export default router;
