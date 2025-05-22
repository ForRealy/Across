import express from "express";
import { getGameReviews, createReview, submitReviewRating, getReviewRating } from "../controllers/reviewController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/games/:id/reviews", getGameReviews);
router.post("/games/:id/reviews", authenticateToken, createReview);

router.post("/reviews/:idReview/rating", authenticateToken, submitReviewRating);
router.get("/reviews/:idReview/rating", authenticateToken, getReviewRating);

export default router;
