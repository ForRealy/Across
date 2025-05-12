var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Download from "../models/Download.js";
export const getDownloads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log("Usuario autenticado:", req.user); // 🔹 Verificar si `req.user` está bien definido
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.idUser;
        if (!userId) {
            res.status(401).json({ success: false, message: "Usuario no autenticado" });
            return;
        }
        const downloads = yield Download.findAll({ where: { idUser: userId } });
        res.status(200).json(downloads);
    }
    catch (error) {
        console.error("Error obteniendo descargas:", error);
        res.status(500).json({ success: false, message: "Error al obtener descargas" });
    }
});
