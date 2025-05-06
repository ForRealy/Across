import express, { Request, Response } from "express";
import {
  fetchGameData,
  fetchUpcomingGames,
  fetchPopularGames,
  fetchGameById,
} from "../controllers/gamesController.js";
import { GameWithCover } from "../controllers/gamesController.js";  // as lo definimos en el controller

const router = express.Router();

/**
 * CACHES Y CONFIGURACIÓN
 */
let libraryCache: GameWithCover[] = [];
let popularCache: GameWithCover[] = [];
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * updateCache(): refresca libraryCache y popularCache cada CACHE_DURATION ms
 */
const updateCache = async () => {
  const now = Date.now();
  if (now - lastCacheUpdate > CACHE_DURATION) {
    const [lib, pop] = await Promise.all([
      fetchGameData(),
      fetchPopularGames(),
    ]);
    libraryCache = lib || [];
    popularCache = pop || [];
    lastCacheUpdate = now;
  }
};

/**
 *  GET /details/:id
 *  Devuelve los datos completos de un juego por su ID,
 *  usando la función fetchGameById del controller.
 */
router.get(
  "/details/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
      }

      // primero intento con cache
      await updateCache();
      let game = libraryCache.find((g) => g.id === id) || popularCache.find((g) => g.id === id);

      // si no está en cache, lo pido directamente
      if (!game) {
        game = await fetchGameById(id);
      }

      if (!game) {
        res.status(404).json({ error: "Juego no encontrado" });
        return;
      }

      res.json(game);
    } catch (err) {
      console.error("Error en /details/:id:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

/**
 *  GET /library
 *  Lista los juegos de tu "biblioteca" (los que vienen de fetchGameData).
 */
router.get("/library", async (_req: Request, res: Response) => {
  try {
    await updateCache();
    res.json(libraryCache);
  } catch (err) {
    console.error("Error en /library:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/**
 *  GET /popular
 *  Lista los juegos populares (los que vienen de fetchPopularGames).
 */
router.get("/popular", async (_req: Request, res: Response) => {
  try {
    await updateCache();
    res.json(popularCache);
  } catch (err) {
    console.error("Error en /popular:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/**
 *  GET /upcoming
 *  Lista los próximos lanzamientos (siempre en tiempo real).
 */
router.get("/upcoming", async (_req: Request, res: Response) => {
  try {
    const upcoming = await fetchUpcomingGames();
    if (!upcoming) {
      res.status(500).json({ error: "Error al obtener próximos lanzamientos" });
      return;
    }
    res.json(upcoming);
  } catch (err) {
    console.error("Error en /upcoming:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
