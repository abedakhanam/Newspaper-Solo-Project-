import { Request, Response } from 'express';
import Comment from '../models/comment';
import { Article } from '../models/article';
import User from '../models/user';

// Create a comment
export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { content } = req.body; // Extract content from request body
  const articleId = parseInt(req.params.articleId, 10); // Extract articleId from URL parameters
  const userId = req.user?.id; // Get userId from authenticated user

  if (isNaN(articleId)) {
    res.status(400).json({ message: 'Invalid articleId' });
    return;
  }

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const article = await Article.findByPk(articleId);
    if (!article) {
      res
        .status(404)
        .json({ message: `Article with ID ${articleId} not found` });
      return;
    }

    const comment = await Comment.create({
      content,
      articleId,
      userId,
    });

    const user = await User.findByPk(userId);

    res.status(201).json({
      message: 'Comment created successfully',
      comment: {
        ...comment.get(),
        username: user?.username,
      },
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a comment
export const updateComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const commentId = parseInt(req.params.commentId, 10);
  const { content } = req.body;
  const userId = req.user?.id;

  if (isNaN(commentId)) {
    res.status(400).json({ message: 'Invalid commentId' });
    return;
  }

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const comment = await Comment.findOne({ where: { id: commentId, userId } });
    if (!comment) {
      res.status(404).json({
        message: `Comment with ID ${commentId} not found or does not belong to user`,
      });
      return;
    }

    comment.content = content;
    await comment.save();

    res.status(200).json({
      message: 'Comment updated successfully',
      comment: comment.get(),
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a comment
export const deleteComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const commentId = parseInt(req.params.commentId, 10);
  const userId = req.user?.id;

  if (isNaN(commentId)) {
    res.status(400).json({ message: 'Invalid commentId' });
    return;
  }

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const comment = await Comment.findOne({ where: { id: commentId, userId } });
    if (!comment) {
      res.status(404).json({
        message: `Comment with ID ${commentId} not found or does not belong to user`,
      });
      return;
    }

    await comment.destroy();

    res.status(200).json({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
