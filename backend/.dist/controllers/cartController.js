var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fetchGameById } from './gamesController.js';
import Cart from '../models/Cart.js';
export const cartController = {
    addProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { productId } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.idUser;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            if (!productId || typeof productId !== 'number') {
                res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido o faltante'
                });
                return;
            }
            // Fetch game data from IGDB
            const gameData = yield fetchGameById(productId);
            if (!gameData) {
                res.status(404).json({
                    success: false,
                    message: 'Juego no encontrado'
                });
                return;
            }
            // Set a default price if not provided by IGDB
            const price = gameData.price || 59.99;
            // Check if the product is already in the cart
            const [cartItem, created] = yield Cart.findOrCreate({
                where: {
                    user_id: userId,
                    game_id: productId
                },
                defaults: {
                    quantity: 1
                }
            });
            if (!created) {
                // If the product already exists, increment the quantity
                cartItem.quantity += 1;
                yield cartItem.save();
            }
            res.status(200).json({
                success: true,
                message: 'Producto añadido al carrito',
                cartItem: Object.assign(Object.assign({}, cartItem.toJSON()), { gameData: Object.assign(Object.assign({}, gameData), { price }) })
            });
        }
        catch (error) {
            console.error('Error en addProduct:', error);
            res.status(500).json({
                success: false,
                message: 'Error al añadir producto al carrito'
            });
        }
    }),
    getCart: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        try {
            const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.idUser;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const cartItems = yield Cart.findAll({
                where: { user_id: userId }
            });
            const enrichedCart = yield Promise.all(cartItems.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const gameData = yield fetchGameById(item.game_id);
                    if (!gameData) {
                        return Object.assign(Object.assign({}, item.toJSON()), { gameData: null });
                    }
                    return Object.assign(Object.assign({}, item.toJSON()), { gameData: Object.assign(Object.assign({}, gameData), { price: gameData.price || 59.99 }) });
                }
                catch (error) {
                    console.error(`Error fetching game ${item.game_id}:`, error);
                    return item.toJSON();
                }
            })));
            // Calculate total
            const total = enrichedCart.reduce((sum, item) => {
                var _a;
                const price = ((_a = item.gameData) === null || _a === void 0 ? void 0 : _a.price) || 59.99;
                return sum + (price * item.quantity);
            }, 0);
            res.status(200).json({
                items: enrichedCart,
                total: total.toFixed(2)
            });
        }
        catch (error) {
            console.error('Error getting cart:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el carrito'
            });
        }
    }),
    removeProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        try {
            const { productId } = req.params;
            const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.idUser;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            const id = Number(productId);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
                return;
            }
            const deleted = yield Cart.destroy({
                where: {
                    user_id: userId,
                    game_id: id
                }
            });
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Juego no encontrado en el carrito'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Juego eliminado del carrito'
            });
        }
        catch (error) {
            console.error('Error removing product:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar del carrito'
            });
        }
    }),
    clearCart: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        try {
            const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.idUser;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }
            yield Cart.destroy({
                where: { user_id: userId }
            });
            res.status(200).json({
                success: true,
                message: 'Carrito vaciado con éxito'
            });
        }
        catch (error) {
            console.error('Error clearing cart:', error);
            res.status(500).json({
                success: false,
                message: 'Error al vaciar el carrito'
            });
        }
    })
};
