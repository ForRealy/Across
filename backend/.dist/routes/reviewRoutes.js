var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { getGameReviews, createReview } from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();
// Get reviews for a game
router.get('/games/:id/reviews', getGameReviews);
// Create a review for a game
router.post('/games/:id/reviews', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield createReview(req, res);
}));
export default router;
