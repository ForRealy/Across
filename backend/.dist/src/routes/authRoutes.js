import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
const router = express.Router();
router.post("/register", registerUser);
router.post("i", loginUser);
export default router;
