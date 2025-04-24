import express, { Request, Response } from "express";
import { fetchGameData } from "../controllers/gamesController.js";

const router = express.Router();

// Definimos una interfaz para el juego que viene de la API
interface IGDBGame {
  name: string;
  cover?: {
    image_id: string;
  };
  id: number;
}

router.get("/library", async (req: Request<{}, any, any, any>, res: Response): Promise<void> => {
  try {
    console.log('Recibida petición a /library');
    const games = await fetchGameData();
    console.log('Juegos obtenidos:', games);
    
    if (!games) {
      res.status(500).json({ error: "Error al obtener los juegos" });
      return;
    }
    
    // Ya no necesitamos transformar los datos aquí porque ya están transformados en el controlador
    res.json(games);
  } catch (error) {
    console.error('Error en la ruta /library:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;