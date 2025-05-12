import express from "express";
import { getGameReviews, createReview } from "../controllers/reviewController.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();
// ✅ Esto debe coincidir con la URL usada en el frontend
router.get("/games/:id/reviews", getGameReviews);
router.post("/games/:id/reviews", authenticateToken, createReview);
export default router;
