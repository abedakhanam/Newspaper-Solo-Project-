// src/routes/visitorActivityRoutes.ts
import express from 'express';
import {
  createVisitorActivity,
  getVisitorActivities,
  getVisitorActivity,
  updateVisitorActivity,
  deleteVisitorActivity,
  getRecommendedArticlesForVisitor,
} from '../controllers/visitoractivity';

const router = express.Router();

router.post('/visitor-activity', createVisitorActivity); // Make sure this line is correct
router.get('/visitor-activities', getVisitorActivities);
router.get(
  '/visitor-activity/recommendations',
  getRecommendedArticlesForVisitor
);

// other routes...

export default router;
