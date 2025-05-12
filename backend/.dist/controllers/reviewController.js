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
// ✅ Obtener todas las reseñas de un juego
export const getGameReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gameId = parseInt(req.params.id);
        console.log('Fetching reviews for game:', gameId);
        const [reviews] = yield pool.query(`
            SELECT r.*, u.profile_name 
            FROM review r
            LEFT JOIN users u ON r.idUser = u.idUser
            WHERE r.idGame = ?
            ORDER BY r.idReview DESC
        `, [gameId]);
        // ✅ Devuelve un array vacío si no hay reseñas en lugar de `404`
        if (reviews.length === 0) {
            console.log(`No reviews found for game ${gameId}`);
            res.status(200).json([]);
            return;
        }
        res.json(reviews);
    }
    catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
// ✅ Crear una nueva reseña
export const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const gameId = parseInt(req.params.id);
        const { review_type, description, recommended } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.idUser; // ✅ Verificación de usuario autenticado
        console.log("Incoming review data:", { gameId, userId, review_type, description, recommended });
        if (!review_type || !description || recommended === undefined) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        // ✅ Eliminamos la validación de existencia del juego en la base de datos
        const [result] = yield pool.query(`INSERT INTO review (idGame, idUser, review_type, description, recommended)
            VALUES (?, ?, ?, ?, ?)`, [gameId, userId, review_type, description, recommended ? 1 : 0]);
        console.log("Review successfully inserted with ID:", result.insertId);
        res.status(201).json({
            message: "Review created successfully",
            reviewId: result.insertId
        });
    }
    catch (error) {
        console.error("Detailed error in createReview:", error);
        res.status(500).json({ message: "Error creating review", error });
    }
});
