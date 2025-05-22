var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pool from '../db.js';
// Obtener todas las reseñas de un juego
export const getGameReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gameId = parseInt(req.params.id);
        const [reviews] = yield pool.query(`
            SELECT r.*, u.profile_name 
            FROM review r
            LEFT JOIN users u ON r.idUser = u.idUser
            WHERE r.idGame = ?
            ORDER BY r.idReview DESC
        `, [gameId]);
        res.status(200).json(reviews.length ? reviews : []);
    }
    catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
// Crear una nueva reseña
export const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const gameId = parseInt(req.params.id);
        const { review_type, description, recommended } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.idUser;
        if (!review_type || !description || recommended === undefined) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const [existingReview] = yield pool.query(`SELECT idReview FROM review WHERE idGame = ? AND idUser = ?`, [gameId, userId]);
        if (existingReview.length > 0) {
            res.status(409).json({ message: "User has already reviewed this game" });
            return;
        }
        const [result] = yield pool.query(`INSERT INTO review (idGame, idUser, review_type, description, recommended)
             VALUES (?, ?, ?, ?, ?)`, [gameId, userId, review_type, description, recommended ? 1 : 0]);
        res.status(201).json({
            message: "Review created successfully",
            reviewId: result.insertId
        });
    }
    catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: "Error creating review", error });
    }
});
// Guardar o actualizar rating de una reseña por usuario
export const submitReviewRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const idReview = parseInt(req.params.idReview);
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.idUser;
        const { rating } = req.body;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ message: "Rating must be between 1 and 5" });
            return;
        }
        yield pool.query(`
      INSERT INTO review_ratings (idReview, idUser, rating)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE rating = ?
      `, [idReview, userId, rating, rating]);
        res.status(200).json({ message: "Rating saved successfully" });
    }
    catch (error) {
        console.error("Error saving review rating:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
// Obtener rating de la reseña para usuario autenticado
export const getReviewRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const idReview = parseInt(req.params.idReview);
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.idUser;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const [rows] = yield pool.query('SELECT rating FROM review_ratings WHERE idReview = ? AND idUser = ?', [idReview, userId]);
        if (rows.length === 0) {
            res.json({ rating: 0 });
            return;
        }
        res.json({ rating: rows[0].rating });
    }
    catch (error) {
        console.error("Error fetching review rating:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
// Get all reviews for a specific user
export const getUserReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.userId);
        const [reviews] = yield pool.query(`
            SELECT r.*, u.profile_name 
            FROM review r
            LEFT JOIN users u ON r.idUser = u.idUser
            WHERE r.idUser = ?
            ORDER BY r.created_at DESC
        `, [userId]);
        res.status(200).json(reviews.length ? reviews : []);
    }
    catch (error) {
        console.error("Error fetching user reviews:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
