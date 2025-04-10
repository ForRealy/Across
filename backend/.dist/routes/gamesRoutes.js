import express from "express";
import { fetchGameData } from "../controllers/gamesController.js";
const router = express.Router();
router.post("/library", fetchGameData);
export default router;
