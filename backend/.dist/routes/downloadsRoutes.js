import express from "express";
import { getDownloads, deleteDownload, downloadGame } from "../controllers/downloadsController.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();
router.get("/", authenticateToken, getDownloads); // ✅ Esto debe estar aquí
router.delete("/:id", authenticateToken, deleteDownload);
router.get("/file/:id", authenticateToken, downloadGame);
export default router;
