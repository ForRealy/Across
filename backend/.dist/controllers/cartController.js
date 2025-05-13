var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fetchGameById } from "./gamesController.js";
import Cart from "../models/Cart.js";
import Download from "../models/Download.js";
export const cartController = {
    addProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { productId } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.idUser;
            if (!userId) {
                res.status(401).json({ success: false, message: "Usuario no autenticado" });
                return;
            }
            if (!productId || typeof productId !== "number") {
                res.status(400).json({ success: false, message: "ID de producto inválido o faltante" });
                return;
            }
            // Verificar si el juego ya está en el carrito
            const existingCartItem = yield Cart.findOne({ where: { user_id: userId, game_id: productId } });
            if (existingCartItem) {
                res.status(409).send("Este juego ya está en tu carrito"); // Debe ser send(), no json()
                return;
            }
            const gameData = yield fetchGameById(productId);
            if (!gameData) {
                res.status(404).json({ success: false, message: "Juego no encontrado" });
                return;
            }
            const price = gameData.price || 59.99;
            // Agregar producto al carrito
            const cartItem = yield Cart.create({ user_id: userId, game_id: productId, quantity: 1 });
            res.status(200).json({
                success: true,
                message: "Producto añadido al carrito",
                cartItem: Object.assign(Object.assign({}, cartItem.toJSON()), { gameData: Object.assign(Object.assign({}, gameData), { price }) }),
            });
        }
        catch (error) {
            console.error("Error en addProduct:", error);
            res.status(500).json({ success: false, message: "Error al añadir producto al carrito" });
        }
    }),
    getCart: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        try {
            const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.idUser;
            if (!userId) {
                res.status(401).json({ success: false, message: "Usuario no autenticado" });
                return;
            }
            const cartItems = yield Cart.findAll({ where: { user_id: userId } });
            const enrichedCart = yield Promise.all(cartItems.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                const gameData = yield fetchGameById(item.game_id);
                return Object.assign(Object.assign({}, item.toJSON()), { gameData: gameData ? Object.assign(Object.assign({}, gameData), { price: gameData.price || 59.99 }) : null });
            })));
            const total = enrichedCart.reduce((sum, item) => { var _a; return sum + ((((_a = item.gameData) === null || _a === void 0 ? void 0 : _a.price) || 59.99) * item.quantity); }, 0);
            res.status(200).json({ items: enrichedCart, total: total.toFixed(2) });
        }
        catch (error) {
            console.error("Error getting cart:", error);
            res.status(500).json({ success: false, message: "Error al obtener el carrito" });
        }
    }),
    removeProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        try {
            const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.idUser;
            const productId = Number(req.params.productId);
            if (!userId) {
                res.status(401).json({ success: false, message: "Usuario no autenticado" });
                return;
            }
            if (isNaN(productId)) {
                res.status(400).json({ success: false, message: "ID de producto inválido" });
                return;
            }
            const cartItem = yield Cart.findOne({ where: { user_id: userId, game_id: productId } });
            if (!cartItem) {
                res.status(404).json({ success: false, message: "Juego no encontrado en el carrito" });
                return;
            }
            if (cartItem.quantity > 1) {
                cartItem.quantity -= 1;
                yield cartItem.save();
            }
            else {
                yield cartItem.destroy();
            }
            res.status(200).json({ success: true, message: "Cantidad reducida/eliminado del carrito", cartItem });
        }
        catch (error) {
            console.error("Error removing product:", error);
            res.status(500).json({ success: false, message: "Error al eliminar del carrito" });
        }
    }),
    checkout: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        try {
            const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.idUser;
            const { cart } = req.body;
            if (!userId) {
                res.status(401).json({ success: false, message: "Usuario no autenticado" });
                return;
            }
            if (!cart || !Array.isArray(cart)) {
                res.status(400).json({ success: false, message: "Carrito inválido" });
                return;
            }
            const downloadEntries = cart.map((item) => ({
                idUser: userId,
                idGame: item.game_id,
                status: "pending",
                download_date: new Date(),
            }));
            yield Download.bulkCreate(downloadEntries);
            yield Cart.destroy({ where: { user_id: userId } });
            res.status(200).json({ success: true, message: "Pago realizado con éxito y juegos guardados en descargas" });
        }
        catch (error) {
            console.error("Error en checkout:", error);
            res.status(500).json({ success: false, message: "Error al procesar el pago" });
        }
    }),
    clearCart: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _e;
        try {
            const userId = (_e = req.user) === null || _e === void 0 ? void 0 : _e.idUser;
            if (!userId) {
                res.status(401).json({ success: false, message: "Usuario no autenticado" });
                return;
            }
            yield Cart.destroy({ where: { user_id: userId } });
            res.status(200).json({ success: true, message: "Carrito vaciado con éxito" });
        }
        catch (error) {
            console.error("Error clearing cart:", error);
            res.status(500).json({ success: false, message: "Error al vaciar el carrito" });
        }
    }),
};
