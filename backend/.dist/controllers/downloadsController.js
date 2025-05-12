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
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Get the absolute path to the downloads directory
const DOWNLOADS_DIR = path.resolve(__dirname, '../../public/downloads');
export const getDownloads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log("Usuario autenticado:", req.user); // 🔹 Verificar si `req.user` está bien definido
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
export const deleteDownload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [result] = yield pool.query('DELETE FROM downloads WHERE idDownload = ? AND idUser = ?', [req.params.id, req.user.id]);
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
export const downloadGame = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const gameId = req.params.id;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.idUser;
        const filePath = path.join(DOWNLOADS_DIR, 'sample.iso');
        console.log('Attempting to download file from:', filePath);
        // Check if file exists before trying to download
        try {
            yield fs.promises.access(filePath);
        }
        catch (err) {
            console.error('File does not exist:', filePath);
            res.status(404).json({ message: 'Game file not found' });
            return;
        }
        // Update status to downloading before starting download
        yield pool.query('UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?', ['downloading', gameId, userId]);
        res.download(filePath, `game-${gameId}.iso`, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Error downloading file:', err);
                // Update status to failed if download fails
                yield pool.query('UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?', ['failed', gameId, userId]);
                res.status(500).json({ message: 'Error downloading file' });
            }
            else {
                // Update status to completed when download finishes
                yield pool.query('UPDATE downloads SET status = ? WHERE idGame = ? AND idUser = ?', ['completed', gameId, userId]);
            }
        }));
    }
    catch (error) {
        console.error('Error in downloadGame:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
