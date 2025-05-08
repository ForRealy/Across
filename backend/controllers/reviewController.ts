import { Request, Response } from 'express';
import pool from '../db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { fetchGameById, cacheGameInDatabase } from './gamesController.js';
import { igdbRequest } from '../utils/igdbRequest.js';

interface Review extends RowDataPacket {
    idReview: number;
    idGame: number;
    idUser: number;
    review_type: string;
    description: string;
    recommended: number; // MySQL uses TINYINT(1) for boolean
    profile_name: string;
    created_at: Date;
    updated_at: Date;
}

interface InvolvedCompany {
    company: {
        name: string;
    };
    developer: boolean;
}

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user: {
                idUser: number;
                [key: string]: any;
            };
        }
    }
}

// Get all reviews for a game
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

        // Convert MySQL boolean (0/1) to JavaScript boolean
        const formattedReviews = reviews.map(review => ({
            ...review,
            recommended: Boolean(review.recommended)
        }));

        console.log('Reviews fetched:', formattedReviews);
        res.json(formattedReviews);
    } catch (error) {
        console.error('Detailed error in getGameReviews:', error);
        res.status(500).json({ 
            message: 'Error fetching reviews',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Create a new review
export const createReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const gameId = parseInt(req.params.id);
        const { review_type, description, recommended } = req.body;
        const userId = req.user.idUser;

        if (!review_type || !description || recommended === undefined) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        console.log('Creating review:', {
            gameId,
            userId,
            review_type,
            description,
            recommended
        });

        // First check if game exists in our database
        const [existingGames] = await pool.query<RowDataPacket[]>(
            'SELECT idGame FROM games WHERE idGame = ?',
            [gameId]
        );

        if (existingGames.length === 0) {
            // Game doesn't exist in our database, fetch from IGDB
            console.log('Game not found in database, fetching from IGDB:', gameId);
            const query = `fields name,first_release_date,summary,cover.image_id,screenshots.image_id,involved_companies.company.name,involved_companies.developer; where id = ${gameId}; limit 1;`;
            
            try {
                const response = await igdbRequest(query);
                const data = response.data;
                
                if (!data || data.length === 0) {
                    res.status(404).json({ message: 'Game not found in IGDB' });
                    return;
                }

                const game = data[0];
                if (!game.name) {
                    res.status(400).json({ message: 'Invalid game data from IGDB' });
                    return;
                }

                // Extract publisher and developer from involved_companies
                const publisher = game.involved_companies?.find((ic: InvolvedCompany) => !ic.developer)?.company?.name;
                const developer = game.involved_companies?.find((ic: InvolvedCompany) => ic.developer)?.company?.name;

                // Cache the game in our database
                await cacheGameInDatabase({
                    id: gameId,
                    name: game.name,
                    first_release_date: game.first_release_date,
                    summary: game.summary,
                    cover: game.cover,
                    screenshots: game.screenshots,
                    publisher: publisher,
                    developer: developer,
                    price: 59.99 // Default price since IGDB doesn't provide it
                });
                console.log('Game cached in database:', gameId);
            } catch (error) {
                console.error('Error fetching game from IGDB:', error);
                res.status(500).json({ 
                    message: 'Error fetching game from IGDB',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                return;
            }
        }

        // Check if user already reviewed this game
        const [existingReviews] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM review WHERE idGame = ? AND idUser = ?',
            [gameId, userId]
        );

        if (existingReviews.length > 0) {
            res.status(400).json({ message: 'You have already reviewed this game' });
            return;
        }

        // Create the review
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO review (idGame, idUser, review_type, description, recommended)
            VALUES (?, ?, ?, ?, ?)`,
            [gameId, userId, review_type, description, recommended ? 1 : 0]
        );

        res.status(201).json({
            message: 'Review created successfully',
            reviewId: result.insertId
        });
    } catch (error) {
        console.error('Detailed error in createReview:', error);
        res.status(500).json({
            message: 'Error creating review',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}; 