import express, { Request, Response } from 'express';
import { getGameReviews, createReview } from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get reviews for a game
router.get('/games/:id/reviews', getGameReviews);

// Create a review for a game
router.post('/games/:id/reviews', authenticateToken, async (req: Request, res: Response) => {
    await createReview(req, res);
});

export default router; 