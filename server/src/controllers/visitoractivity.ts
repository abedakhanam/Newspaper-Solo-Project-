// src/controllers/visitorActivityController.ts
import { Request, Response } from 'express';
import VisitorActivity from '../models/VisitorActivity';

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
