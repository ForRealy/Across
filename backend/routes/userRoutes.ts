// src/routes/userRoutes.ts
import express from 'express';
import { updateUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.put('/profile/:idUser', updateUserProfile);
export default router;