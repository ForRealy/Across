import pool from '../db.js';
// Obtener todas las reseñas de un juego
export const getGameReviews = async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);
        const [reviews] = await pool.query(`
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
};
// Crear una nueva reseña
export const createReview = async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);
        const { review_type, description, recommended } = req.body;
        const userId = req.user?.idUser;
        if (!review_type || !description || recommended === undefined) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const [existingReview] = await pool.query(`SELECT idReview FROM review WHERE idGame = ? AND idUser = ?`, [gameId, userId]);
        if (existingReview.length > 0) {
            res.status(409).json({ message: "User has already reviewed this game" });
            return;
        }
        const [result] = await pool.query(`INSERT INTO review (idGame, idUser, review_type, description, recommended)
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
};
// Guardar o actualizar rating de una reseña por usuario
export const submitReviewRating = async (req, res) => {
    try {
        const idReview = parseInt(req.params.idReview);
        const userId = req.user?.idUser;
        const { rating } = req.body;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ message: "Rating must be between 1 and 5" });
            return;
        }
        await pool.query(`
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
};
// Obtener rating de la reseña para usuario autenticado
export const getReviewRating = async (req, res) => {
    try {
        const idReview = parseInt(req.params.idReview);
        const userId = req.user?.idUser;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const [rows] = await pool.query('SELECT rating FROM review_ratings WHERE idReview = ? AND idUser = ?', [idReview, userId]);
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
};
// Get all reviews for a specific user
export const getUserReviews = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const [reviews] = await pool.query(`
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
};
