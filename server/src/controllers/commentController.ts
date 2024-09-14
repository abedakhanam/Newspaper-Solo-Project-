import { Request, Response } from 'express';
import Comment from '../models/comment';
import Article from '../models/article'; // Assuming Article model exists

// Create a comment
export const createComment = async (req: Request, res: Response) => {
  const { content, articleId } = req.body; // Extracting articleId and content from body
  const userId = req.user?.id; // Getting the userId from the authenticated user (JWT or session)

  // Ensure that articleId is passed and is a valid number
  if (!articleId || isNaN(articleId)) {
    return res.status(400).json({ message: 'Invalid or missing articleId' });
  }

  try {
    // Find the article by its ID to ensure it exists
    const article = await Article.findByPk(articleId);

    if (!article) {
      // Article not found, return a 404 error
      return res
        .status(404)
        .json({ message: `Article with ID ${articleId} not found` });
    }

    // Create the comment if the article exists
    const comment = await Comment.create({
      content,
      articleId,
      userId, // Assuming userId is passed from authenticated user
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
