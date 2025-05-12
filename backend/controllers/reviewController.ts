import { Request, Response } from 'express';
import pool from '../db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Review extends RowDataPacket {
    idReview: number;
    idGame: number;
    idUser: number;
    review_type: string;
    description: string;
    recommended: number;
    profile_name: string;
    created_at: Date;
    updated_at: Date;
}

// Extend Express Request type to include user authentication
declare global {
    namespace Express {
        interface Request {
            user?: {
                idUser: number;
                [key: string]: any;
            };
        }
    }
}

// ✅ Obtener todas las reseñas de un juego
export const getGameReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const gameId = parseInt(req.params.id);
        console.log('Fetching reviews for game:', gameId);

        const [reviews] = await pool.query<Review[]>(`
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
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// ✅ Crear una nueva reseña
export const createReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const gameId = parseInt(req.params.id);
        const { review_type, description, recommended } = req.body;
        const userId = req.user?.idUser;

        console.log("Incoming review data:", { gameId, userId, review_type, description, recommended });

        if (!review_type || !description || recommended === undefined) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        // 🔍 Verificar si el usuario ya ha reseñado este juego
        const [existingReview] = await pool.query<Review[]>(
            `SELECT idReview FROM review WHERE idGame = ? AND idUser = ?`,
            [gameId, userId]
        );

        if (existingReview.length > 0) {
            res.status(409).json({ message: "User has already reviewed this game" });
            return;
        }

        // ✅ Crear la reseña si no existe una previa
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO review (idGame, idUser, review_type, description, recommended)
             VALUES (?, ?, ?, ?, ?)`,
            [gameId, userId, review_type, description, recommended ? 1 : 0]
        );

        console.log("Review successfully inserted with ID:", result.insertId);

        res.status(201).json({
            message: "Review created successfully",
            reviewId: result.insertId
        });
    } catch (error) {
        console.error("Detailed error in createReview:", error);
        res.status(500).json({ message: "Error creating review", error });
    }
};

