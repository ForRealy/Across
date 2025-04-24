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
        console.log('Recibida petición a /library');
        const games = yield fetchGameData();
        console.log('Juegos obtenidos:', games);
        if (!games) {
            res.status(500).json({ error: "Error al obtener los juegos" });
            return;
        }
        // Ya no necesitamos transformar los datos aquí porque ya están transformados en el controlador
        res.json(games);
    }
    catch (error) {
        console.error('Error en la ruta /library:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}));
export default router;
