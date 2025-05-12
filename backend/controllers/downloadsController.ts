import { Request, Response } from "express";
import Download from "../models/Download.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from '../db.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the absolute path to the downloads directory
const DOWNLOADS_DIR = path.resolve(__dirname, '../../public/downloads');

export const getDownloads = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Usuario autenticado:", (req as any).user); // 🔹 Verificar si `req.user` está bien definido

    const userId = (req as any).user?.idUser;
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

export const deleteDownload = async (req: Request, res: Response): Promise<void> => {
    try {
        const [result] = await pool.query(
            'DELETE FROM downloads WHERE idDownload = ? AND idUser = ?',
            [req.params.id, req.user.id]
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

export const downloadGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = req.params.id;
    const userId = (req as any).user?.idUser;
    const filePath = path.join(DOWNLOADS_DIR, 'sample.iso');
    console.log('Attempting to download file from:', filePath);

    // Check if file exists before trying to download
    try {
      await fs.promises.access(filePath);
    } catch (err) {
      console.error('File does not exist:', filePath);
      res.status(404).json({ message: 'Game file not found' });
      return;
    }

    // Update status to downloading before starting download
    await pool.query(
      'UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?',
      ['downloading', gameId, userId]
    );

    res.download(filePath, `game-${gameId}.iso`, async (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        // Update status to failed if download fails
        await pool.query(
          'UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?',
          ['failed', gameId, userId]
        );
        res.status(500).json({ message: 'Error downloading file' });
      } else {
        // Update status to completed when download finishes
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

