// src/routes/userRoutes.ts
import express from 'express';
import { updateUserProfile } from '../controllers/userController';

const router = express.Router();

router.put('/profile/:id', updateUserProfile); // id = idUser

export default router;
