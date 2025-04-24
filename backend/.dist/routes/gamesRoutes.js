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
import { fetchGameData } from "../controllers/gamesController.js";
const router = express.Router();
router.get("/library", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const games = yield fetchGameData();
        if (!games) {
            res.status(500).json({ error: "Error al obtener los juegos" });
            return;
        }
        // Transformar los datos al formato que espera el frontend
        const formattedGames = games.map((game) => {
            var _a;
            return ({
                title: game.name,
                cover: `https://images.igdb.com/igdb/image/upload/t_cover_big/${(_a = game.cover) === null || _a === void 0 ? void 0 : _a.image_id}.jpg`,
                path: `/game/${game.id}`
            });
        });
        res.json(formattedGames);
    }
    catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
}));
export default router;
