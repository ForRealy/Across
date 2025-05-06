var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { fetchGameData, fetchUpcomingGames, fetchPopularGames, fetchGameById, } from "../controllers/gamesController.js";
const router = express.Router();
/**
 * CACHES Y CONFIGURACIÓN
 */
let libraryCache = [];
let popularCache = [];
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
/**
 * updateCache(): refresca libraryCache y popularCache cada CACHE_DURATION ms
 */
const updateCache = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = Date.now();
    if (now - lastCacheUpdate > CACHE_DURATION) {
        const [lib, pop] = yield Promise.all([
            fetchGameData(),
            fetchPopularGames(),
        ]);
        libraryCache = lib || [];
        popularCache = pop || [];
        lastCacheUpdate = now;
    }
});
/**
 *  GET /details/:id
 *  Devuelve los datos completos de un juego por su ID,
 *  usando la función fetchGameById del controller.
 */
router.get("/details/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "ID inválido" });
            return;
        }
        // primero intento con cache
        yield updateCache();
        let game = libraryCache.find((g) => g.id === id) || popularCache.find((g) => g.id === id);
        // si no está en cache, lo pido directamente
        if (!game) {
            game = yield fetchGameById(id);
        }
        if (!game) {
            res.status(404).json({ error: "Juego no encontrado" });
            return;
        }
        res.json(game);
    }
    catch (err) {
        console.error("Error en /details/:id:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}));
/**
 *  GET /library
 *  Lista los juegos de tu "biblioteca" (los que vienen de fetchGameData).
 */
router.get("/library", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield updateCache();
        res.json(libraryCache);
    }
    catch (err) {
        console.error("Error en /library:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}));
/**
 *  GET /popular
 *  Lista los juegos populares (los que vienen de fetchPopularGames).
 */
router.get("/popular", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield updateCache();
        res.json(popularCache);
    }
    catch (err) {
        console.error("Error en /popular:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}));
/**
 *  GET /upcoming
 *  Lista los próximos lanzamientos (siempre en tiempo real).
 */
router.get("/upcoming", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const upcoming = yield fetchUpcomingGames();
        if (!upcoming) {
            res.status(500).json({ error: "Error al obtener próximos lanzamientos" });
            return;
        }
        res.json(upcoming);
    }
    catch (err) {
        console.error("Error en /upcoming:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}));
export default router;
