// src/controllers/userController.ts
import { Request, Response } from 'express';
import db from '../db'; // Tu conexión o pool de base de datos

export const updateUserProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { profile_name, real_name, username, biography, idLanguage } = req.body;

  try {
    await db.query(
      `UPDATE users SET 
        profile_name = ?, 
        real_name = ?, 
        username = ?, 
        biography = ?, 
        idLanguage = ? 
      WHERE idUser = ?`,
      [profile_name, real_name, username, biography, idLanguage, id]
    );

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
