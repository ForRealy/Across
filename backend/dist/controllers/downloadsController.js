import Download from "../models/Download.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from '../db.js';
import fs from 'fs';
import { fetchGameById } from './gamesController.js';
// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Absolute path to the downloads directory
const DOWNLOADS_DIR = path.resolve(__dirname, '../../public/downloads');
// GET /downloads - Get all downloads for the authenticated user
export const getDownloads = async (req, res) => {
    try {
        const userId = req.user?.idUser;
        if (!userId) {
            res.status(401).json({ success: false, message: "Usuario no autenticado" });
            return;
        }
        const downloads = await Download.findAll({ where: { idUser: userId } });
        // Enriquecer cada descarga con título y precio del juego usando fetchGameById
        const downloadsWithDetails = await Promise.all(downloads.map(async (download) => {
            const game = await fetchGameById(download.idGame);
            return {
                idDownload: download.idDownload,
                idGame: download.idGame,
                title: game?.title ?? `Juego ${download.idGame}`,
                price: game?.price ?? null,
                status: download.status, // si tienes más campos como status, añádelos
            };
        }));
        res.status(200).json(downloadsWithDetails);
    }
    catch (error) {
        console.error("Error obteniendo descargas:", error);
        res.status(500).json({ success: false, message: "Error al obtener descargas" });
    }
};
// GET /downloads/check/:gameId - Verifica si un juego ya está en descargas
export const checkDownload = async (req, res) => {
    try {
        const userId = req.user?.idUser;
        const { gameId } = req.params;
        if (!userId) {
            res.status(401).json({ success: false, message: "Usuario no autenticado" });
            return;
        }
        const existingDownload = await Download.findOne({ where: { idUser: userId, idGame: gameId } });
        if (existingDownload) {
            res.status(200).json({ isDownloaded: true });
        }
        else {
            res.status(200).json({ isDownloaded: false });
        }
    }
    catch (error) {
        console.error("Error checking downloads:", error);
        res.status(500).json({ success: false, message: "Error al verificar descargas" });
    }
};
// DELETE /downloads/:id - Delete a download for the authenticated user
export const deleteDownload = async (req, res) => {
    try {
        const userId = req.user?.idUser;
        if (!userId) {
            res.status(401).json({ success: false, message: "Usuario no autenticado" });
            return;
        }
        const [result] = await pool.query('DELETE FROM downloads WHERE idDownload = ? AND idUser = ?', [req.params.id, userId]);
        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: "Download not found" });
            return;
        }
        res.json({ success: true, message: "Download deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting download:", error);
        res.status(500).json({ success: false, message: "Error deleting download" });
    }
};
// GET /download/:id - Download a game and update status
export const downloadGame = async (req, res) => {
    try {
        const gameId = req.params.id;
        const userId = req.user?.idUser;
        if (!userId) {
            res.status(401).json({ message: "Usuario no autenticado" });
            return;
        }
        // Get game details from IGDB
        const gameDetails = await fetchGameById(parseInt(gameId));
        if (!gameDetails) {
            res.status(404).json({ message: 'Game not found' });
            return;
        }
        const sanitizedTitle = gameDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filePath = path.join(DOWNLOADS_DIR, 'sample.iso');
        console.log('Attempting to download file from:', filePath);
        // Ensure file exists
        try {
            await fs.promises.access(filePath);
        }
        catch (err) {
            console.error('File does not exist:', filePath);
            res.status(404).json({ message: 'Game file not found' });
            return;
        }
        // Set download status to "downloading"
        await pool.query('UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?', ['downloading', gameId, userId]);
        // Start the download with the game title as filename
        res.download(filePath, `${sanitizedTitle}.iso`, async (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                // Update status to "failed"
                await pool.query('UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?', ['failed', gameId, userId]);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Error downloading file' });
                }
            }
            else {
                // Update status to "completed"
                await pool.query('UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?', ['completed', gameId, userId]);
            }
        });
    }
    catch (error) {
        console.error('Error in downloadGame:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
