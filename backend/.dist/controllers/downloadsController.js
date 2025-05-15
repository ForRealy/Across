var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
export const getDownloads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.idUser;
        if (!userId) {
            res.status(401).json({ success: false, message: "Usuario no autenticado" });
            return;
        }
        const downloads = yield Download.findAll({ where: { idUser: userId } });
        res.status(200).json(downloads);
    }
    catch (error) {
        console.error("Error obteniendo descargas:", error);
        res.status(500).json({ success: false, message: "Error al obtener descargas" });
    }
});
// GET /downloads/check/:gameId - Verifica si un juego ya está en descargas
export const checkDownload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.idUser;
        const { gameId } = req.params;
        if (!userId) {
            res.status(401).json({ success: false, message: "Usuario no autenticado" });
            return;
        }
        const existingDownload = yield Download.findOne({ where: { idUser: userId, idGame: gameId } });
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
});
// DELETE /downloads/:id - Delete a download for the authenticated user
export const deleteDownload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.idUser;
        if (!userId) {
            res.status(401).json({ success: false, message: "Usuario no autenticado" });
            return;
        }
        const [result] = yield pool.query('DELETE FROM downloads WHERE idDownload = ? AND idUser = ?', [req.params.id, userId]);
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
});
// GET /download/:id - Download a game and update status
export const downloadGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const gameId = req.params.id;
        const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.idUser;
        if (!userId) {
            res.status(401).json({ message: "Usuario no autenticado" });
            return;
        }
        // Get game details from IGDB
        const gameDetails = yield fetchGameById(parseInt(gameId));
        if (!gameDetails) {
            res.status(404).json({ message: 'Game not found' });
            return;
        }
        const sanitizedTitle = gameDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filePath = path.join(DOWNLOADS_DIR, 'sample.iso');
        console.log('Attempting to download file from:', filePath);
        // Ensure file exists
        try {
            yield fs.promises.access(filePath);
        }
        catch (err) {
            console.error('File does not exist:', filePath);
            res.status(404).json({ message: 'Game file not found' });
            return;
        }
        // Set download status to "downloading"
        yield pool.query('UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?', ['downloading', gameId, userId]);
        // Start the download with the game title as filename
        res.download(filePath, `${sanitizedTitle}.iso`, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Error downloading file:', err);
                // Update status to "failed"
                yield pool.query('UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?', ['failed', gameId, userId]);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Error downloading file' });
                }
            }
            else {
                // Update status to "completed"
                yield pool.query('UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?', ['completed', gameId, userId]);
            }
        }));
    }
    catch (error) {
        console.error('Error in downloadGame:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
