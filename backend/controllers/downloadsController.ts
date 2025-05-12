import { Request, Response } from "express";
import Download from "../models/Download.js";

export const getDownloads = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Usuario autenticado:", (req as any).user); // 🔹 Verificar si `req.user` está bien definido

    const userId = (req as any).user?.idUser;
    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    const downloads = await Download.findAll({ where: { idUser: userId } });
    res.status(200).json(downloads);
  } catch (error) {
    console.error("Error obteniendo descargas:", error);
    res.status(500).json({ success: false, message: "Error al obtener descargas" });
  }
};

