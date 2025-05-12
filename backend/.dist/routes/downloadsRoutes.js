import express from "express";
import { getDownloads } from "../controllers/downloadsController.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();
router.get("/", authenticateToken, getDownloads); // ✅ Esto debe estar aquí
export default router;
