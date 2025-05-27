// src/controllers/userController.ts
import { Request, Response } from 'express';
import db from '../db.js';

export const updateUserProfile = async (req: Request, res: Response) => {
  const { idUser } = req.params;
  const { profile_name, real_name, username, biography, idLanguage } = req.body;

  try {
    await db.query(
      `UPDATE users SET 
      profile_name = ?, 
      real_name = ?, 
      username = ?, 
      biography = ?, 
      id_language = ?
      WHERE id_user = ?`,
      [profile_name, real_name, username, biography, idLanguage, idUser]
    );

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};