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
    const games = await fetchGameData();
    if (!games) {
      res.status(500).json({ error: "Error al obtener los juegos" });
      return;
    }
    
    // Transformar los datos al formato que espera el frontend
    const formattedGames = games.map((game: IGDBGame) => ({
      title: game.name,
      cover: `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover?.image_id}.jpg`,
      path: `/game/${game.id}`
    }));
    
    res.json(formattedGames);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;