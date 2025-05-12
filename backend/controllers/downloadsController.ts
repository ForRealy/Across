import { Request, Response } from "express";
import Download from "../models/Download.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from '../db.js';
import fs from 'fs';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Absolute path to the downloads directory
const DOWNLOADS_DIR = path.resolve(__dirname, '../../public/downloads');

// GET /downloads - Get all downloads for the authenticated user
export const getDownloads = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.idUser;

    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    const downloads = await Download.findAll({ where: { idUser: userId } });
    res.status(200).json(downloads);
  } catch (error) {
    console.error("Error obteniendo descargas:", error);
    res.status(500).json({ success: false, message: "Error al obtener descargas" });
  }
};

// DELETE /downloads/:id - Delete a download for the authenticated user
export const deleteDownload = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.idUser;

    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    const [result] = await pool.query(
      'DELETE FROM downloads WHERE idDownload = ? AND idUser = ?',
      [req.params.id, userId]
    );

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ success: false, message: "Download not found" });
      return;
    }

    res.json({ success: true, message: "Download deleted successfully" });
  } catch (error) {
    console.error("Error deleting download:", error);
    res.status(500).json({ success: false, message: "Error deleting download" });
  }
};

// GET /download/:id - Download a game and update status
export const downloadGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = req.params.id;
    const userId = req.user?.idUser;

    if (!userId) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }

    const filePath = path.join(DOWNLOADS_DIR, 'sample.iso');
    console.log('Attempting to download file from:', filePath);

    // Ensure file exists
    try {
      await fs.promises.access(filePath);
    } catch (err) {
      console.error('File does not exist:', filePath);
      res.status(404).json({ message: 'Game file not found' });
      return;
    }

    // Set download status to "downloading"
    await pool.query(
      'UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?',
      ['downloading', gameId, userId]
    );

    // Start the download
    res.download(filePath, `game-${gameId}.iso`, async (err) => {
      if (err) {
        console.error('Error downloading file:', err);

        // Update status to "failed"
        await pool.query(
          'UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?',
          ['failed', gameId, userId]
        );

        if (!res.headersSent) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      } else {
        // Update status to "completed"
        await pool.query(
          'UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?',
          ['completed', gameId, userId]
        );
      }
    });
  } catch (error) {
    console.error('Error in downloadGame:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
