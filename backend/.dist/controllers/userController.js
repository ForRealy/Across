var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import db from '../db';
export const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idUser } = req.params;
    const { profile_name, real_name, username, biography, idLanguage } = req.body;
    console.log(req.params);
    console.log(req.body);
    try {
        yield db.query(`UPDATE users SET 
      profile_name = ?, 
      real_name = ?, 
      username = ?, 
      biography = ?, 
      id_language = ?
      WHERE id_user = ?`, [profile_name, real_name, username, biography, idLanguage, idUser]);
        res.status(200).json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
