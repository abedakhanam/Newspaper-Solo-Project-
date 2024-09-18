// src/controllers/CommentController.ts
import { Request, Response } from 'express';
import Comment from '../models/comment';
import { Article } from '../models/article';
import User from '../models/user'; // Import User model

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
      res
        .status(404)
        .json({ message: `Article with ID ${articleId} not found` });
      return; // End the function if article not found
    }

    // Create the comment
    const comment = await Comment.create({
      content,
      articleId,
      userId,
    });

    // Retrieve the user's username
    const user = await User.findByPk(userId);

    res.status(201).json({
      message: 'Comment created successfully',
      comment: {
        ...comment.get(),
        username: user?.username, // Include username in the response
      },
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
