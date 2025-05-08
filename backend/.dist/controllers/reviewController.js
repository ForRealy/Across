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
import { cacheGameInDatabase } from './gamesController.js';
import { igdbRequest } from '../utils/igdbRequest.js';
// Get all reviews for a game
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
        // Convert MySQL boolean (0/1) to JavaScript boolean
        const formattedReviews = reviews.map(review => (Object.assign(Object.assign({}, review), { recommended: Boolean(review.recommended) })));
        console.log('Reviews fetched:', formattedReviews);
        res.json(formattedReviews);
    }
    catch (error) {
        console.error('Detailed error in getGameReviews:', error);
        res.status(500).json({
            message: 'Error fetching reviews',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Create a new review
export const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
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
        const [existingGames] = yield pool.query('SELECT idGame FROM games WHERE idGame = ?', [gameId]);
        if (existingGames.length === 0) {
            // Game doesn't exist in our database, fetch from IGDB
            console.log('Game not found in database, fetching from IGDB:', gameId);
            const query = `fields name,first_release_date,summary,cover.image_id,screenshots.image_id,involved_companies.company.name,involved_companies.developer; where id = ${gameId}; limit 1;`;
            try {
                const response = yield igdbRequest(query);
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
                const publisher = (_c = (_b = (_a = game.involved_companies) === null || _a === void 0 ? void 0 : _a.find((ic) => !ic.developer)) === null || _b === void 0 ? void 0 : _b.company) === null || _c === void 0 ? void 0 : _c.name;
                const developer = (_f = (_e = (_d = game.involved_companies) === null || _d === void 0 ? void 0 : _d.find((ic) => ic.developer)) === null || _e === void 0 ? void 0 : _e.company) === null || _f === void 0 ? void 0 : _f.name;
                // Cache the game in our database
                yield cacheGameInDatabase({
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
            }
            catch (error) {
                console.error('Error fetching game from IGDB:', error);
                res.status(500).json({
                    message: 'Error fetching game from IGDB',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                return;
            }
        }
        // Check if user already reviewed this game
        const [existingReviews] = yield pool.query('SELECT * FROM review WHERE idGame = ? AND idUser = ?', [gameId, userId]);
        if (existingReviews.length > 0) {
            res.status(400).json({ message: 'You have already reviewed this game' });
            return;
        }
        // Create the review
        const [result] = yield pool.query(`INSERT INTO review (idGame, idUser, review_type, description, recommended)
            VALUES (?, ?, ?, ?, ?)`, [gameId, userId, review_type, description, recommended ? 1 : 0]);
        res.status(201).json({
            message: 'Review created successfully',
            reviewId: result.insertId
        });
    }
    catch (error) {
        console.error('Detailed error in createReview:', error);
        res.status(500).json({
            message: 'Error creating review',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
