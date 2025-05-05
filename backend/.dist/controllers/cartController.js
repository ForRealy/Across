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
export const cartController = {
    getCart: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const username = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.username;
            if (!username) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            // Get user ID from username
            const [users] = yield pool.query('SELECT idUser FROM users WHERE username = ?', [username]);
            if (!users.length) {
                res.status(401).json({ error: 'User not found' });
                return;
            }
            const userId = users[0].idUser;
            const [rows] = yield pool.query(`SELECT c.*, g.name as game_name, g.price 
         FROM cart c 
         JOIN games g ON c.game_id = g.idGame 
         WHERE c.user_id = ?`, [userId]);
            res.json({
                id: userId,
                products: rows.map(row => ({
                    productId: row.game_name,
                    quantity: row.quantity,
                    price: row.price
                }))
            });
        }
        catch (error) {
            console.error('Error getting cart:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }),
    addProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        try {
            const username = (_d = (_c = req.session) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.username;
            if (!username) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            // Get user ID from username
            const [users] = yield pool.query('SELECT idUser FROM users WHERE username = ?', [username]);
            if (!users.length) {
                res.status(401).json({ error: 'User not found' });
                return;
            }
            const userId = users[0].idUser;
            const { game } = req.body;
            // First get the game ID from the name
            const [games] = yield pool.query('SELECT idGame FROM games WHERE name = ?', [game]);
            if (!games.length) {
                res.status(404).json({ error: 'Game not found' });
                return;
            }
            const gameId = games[0].idGame;
            // Check if game is already in cart
            const [existingItems] = yield pool.query('SELECT * FROM cart WHERE user_id = ? AND game_id = ?', [userId, gameId]);
            if (existingItems.length > 0) {
                // Update quantity
                yield pool.query('UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND game_id = ?', [userId, gameId]);
            }
            else {
                // Add new item
                yield pool.query('INSERT INTO cart (user_id, game_id, quantity) VALUES (?, ?, 1)', [userId, gameId]);
            }
            // Get updated cart
            const [updatedCart] = yield pool.query(`SELECT c.*, g.name as game_name, g.price 
         FROM cart c 
         JOIN games g ON c.game_id = g.idGame 
         WHERE c.user_id = ?`, [userId]);
            res.status(200).json({
                id: userId,
                products: updatedCart.map(row => ({
                    productId: row.game_name,
                    quantity: row.quantity,
                    price: row.price
                }))
            });
        }
        catch (error) {
            console.error('Error adding to cart:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }),
    removeProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _e, _f;
        try {
            const username = (_f = (_e = req.session) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.username;
            if (!username) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            // Get user ID from username
            const [users] = yield pool.query('SELECT idUser FROM users WHERE username = ?', [username]);
            if (!users.length) {
                res.status(401).json({ error: 'User not found' });
                return;
            }
            const userId = users[0].idUser;
            const { productId } = req.params;
            // Get game ID from name
            const [games] = yield pool.query('SELECT idGame FROM games WHERE name = ?', [productId]);
            if (!games.length) {
                res.status(404).json({ error: 'Game not found' });
                return;
            }
            const gameId = games[0].idGame;
            // Remove from cart
            yield pool.query('DELETE FROM cart WHERE user_id = ? AND game_id = ?', [userId, gameId]);
            // Get updated cart
            const [updatedCart] = yield pool.query(`SELECT c.*, g.name as game_name, g.price 
         FROM cart c 
         JOIN games g ON c.game_id = g.idGame 
         WHERE c.user_id = ?`, [userId]);
            res.status(200).json({
                id: userId,
                products: updatedCart.map(row => ({
                    productId: row.game_name,
                    quantity: row.quantity,
                    price: row.price
                }))
            });
        }
        catch (error) {
            console.error('Error removing from cart:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }),
    clearCart: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _g, _h;
        try {
            const username = (_h = (_g = req.session) === null || _g === void 0 ? void 0 : _g.user) === null || _h === void 0 ? void 0 : _h.username;
            if (!username) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            // Get user ID from username
            const [users] = yield pool.query('SELECT idUser FROM users WHERE username = ?', [username]);
            if (!users.length) {
                res.status(401).json({ error: 'User not found' });
                return;
            }
            const userId = users[0].idUser;
            // Clear cart
            yield pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);
            res.status(200).json({
                id: userId,
                products: []
            });
        }
        catch (error) {
            console.error('Error clearing cart:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    })
};
