import { Request, Response } from 'express';
import pool from '../db.js';
import { RowDataPacket, OkPacket } from 'mysql2';
import { Session, SessionData } from 'express-session';

interface SessionRequest extends Request {
  session: Session & Partial<SessionData> & {
    user?: {
      username: string;
    };
  };
}

interface GameRow extends RowDataPacket {
  idGame: number;
  name: string;
  price: number;
}

interface CartRow extends RowDataPacket {
  id: number;
  user_id: number;
  game_id: number;
  quantity: number;
  created_at: string;
  game_name: string;
  price: number;
}

export const cartController = {
  // ✅ Obtener el carrito
  getCart: async (req: SessionRequest, res: Response): Promise<void> => {
    try {
      const username = req.session?.user?.username;
      if (!username) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT idUser FROM users WHERE username = ?',
        [username]
      );

      if (!users.length) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      const userId = users[0].idUser;

      const [rows] = await pool.query<CartRow[]>(
        `SELECT c.*, g.name as game_name, g.price 
         FROM addtocart c 
         JOIN games g ON c.game_id = g.idGame 
         WHERE c.user_id = ?`,
        [userId]
      );

      res.json({
        id: userId,
        products: rows.map(row => ({
          productId: row.game_name,
          quantity: row.quantity,
          price: row.price
        }))
      });
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ✅ Agregar producto al carrito
  addProduct: async (req: SessionRequest, res: Response): Promise<void> => {
    try {
      const username = req.session?.user?.username;
      if (!username) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT idUser FROM users WHERE username = ?',
        [username]
      );

      if (!users.length) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      const userId = users[0].idUser;
      const { game } = req.body;

      const [games] = await pool.query<GameRow[]>(
        'SELECT idGame FROM games WHERE name = ?',
        [game]
      );

      if (!games.length) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }

      const gameId = games[0].idGame;

      const [existingItems] = await pool.query<CartRow[]>(
        'SELECT * FROM addtocart WHERE user_id = ? AND game_id = ?',
        [userId, gameId]
      );

      if (existingItems.length > 0) {
        await pool.query<OkPacket>(
          'UPDATE addtocart SET quantity = quantity + 1 WHERE user_id = ? AND game_id = ?',
          [userId, gameId]
        );
      } else {
        await pool.query<OkPacket>(
          'INSERT INTO addtocart (user_id, game_id, quantity) VALUES (?, ?, 1)',
          [userId, gameId]
        );
      }

      const [updatedCart] = await pool.query<CartRow[]>(
        `SELECT c.*, g.name as game_name, g.price 
         FROM addtocart c 
         JOIN games g ON c.game_id = g.idGame 
         WHERE c.user_id = ?`,
        [userId]
      );

      res.status(200).json({
        id: userId,
        products: updatedCart.map(row => ({
          productId: row.game_name,
          quantity: row.quantity,
          price: row.price
        }))
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ✅ Eliminar producto del carrito
  removeProduct: async (req: SessionRequest, res: Response): Promise<void> => {
    try {
      const username = req.session?.user?.username;
      if (!username) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT idUser FROM users WHERE username = ?',
        [username]
      );

      if (!users.length) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      const userId = users[0].idUser;
      const { productId } = req.params;

      const [games] = await pool.query<GameRow[]>(
        'SELECT idGame FROM games WHERE name = ?',
        [productId]
      );

      if (!games.length) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }

      const gameId = games[0].idGame;

      await pool.query<OkPacket>(
        'DELETE FROM addtocart WHERE user_id = ? AND game_id = ?',
        [userId, gameId]
      );

      const [updatedCart] = await pool.query<CartRow[]>(
        `SELECT c.*, g.name as game_name, g.price 
         FROM addtocart c 
         JOIN games g ON c.game_id = g.idGame 
         WHERE c.user_id = ?`,
        [userId]
      );

      res.status(200).json({
        id: userId,
        products: updatedCart.map(row => ({
          productId: row.game_name,
          quantity: row.quantity,
          price: row.price
        }))
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ✅ Vaciar el carrito
  clearCart: async (req: SessionRequest, res: Response): Promise<void> => {
    try {
      const username = req.session?.user?.username;
      if (!username) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT idUser FROM users WHERE username = ?',
        [username]
      );

      if (!users.length) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      const userId = users[0].idUser;

      await pool.query<OkPacket>(
        'DELETE FROM addtocart WHERE user_id = ?',
        [userId]
      );

      res.status(200).json({
        id: userId,
        products: []
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
