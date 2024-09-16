import { Request, Response } from 'express';
import Comment from '../models/comment';
import { Article } from '../models/article';

// Create a comment
export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { content } = req.body; // Extract content from request body
  const articleId = parseInt(req.params.articleId, 10); // Extract articleId from URL parameters
  const userId = req.user?.id; // Get userId from authenticated user

  // Ensure articleId is a valid number
  if (isNaN(articleId)) {
    res.status(400).json({ message: 'Invalid articleId' });
    return; // End the function if invalid articleId
  }

  // Ensure userId is present
  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return; // End the function if user is not authenticated
  }

  try {
    // Find the article to ensure it exists
    const article = await Article.findByPk(articleId);

    if (!article) {
      // If article not found, return 404 error
      res
        .status(404)
        .json({ message: `Article with ID ${articleId} not found` });
      return; // End the function if article not found
    }

    // Create the comment if the article exists
    const comment = await Comment.create({
      content,
      articleId,
      userId, // Set the userId from the authenticated user
    });

    res.status(201).json({
      message: 'Comment created successfully',
      comment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
