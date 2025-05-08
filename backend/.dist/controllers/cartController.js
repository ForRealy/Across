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
let cartItems = [];
// Type guards
function isConnectionError(error) {
    return error instanceof Error && 'code' in error;
}
function isAxiosError(error) {
    return error.isAxiosError !== undefined;
}
export const cartController = {
    addProduct: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const { productId } = req.body;
            if (!productId || typeof productId !== 'number') {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido o faltante'
                });
            }
            const gameData = yield fetchGameById(productId);
            if (!gameData) {
                return res.status(404).json({
                    success: false,
                    message: 'Juego no encontrado en la base de datos'
                });
            }
            const existingItem = cartItems.find(item => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += 1;
                existingItem.addedAt = new Date();
            }
            else {
                cartItems.push({
                    productId,
                    quantity: 1,
                    addedAt: new Date(),
                    gameData
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Producto añadido al carrito',
                cartItem: Object.assign(Object.assign({}, (existingItem || { productId, quantity: 1, addedAt: new Date() })), { gameData })
            });
        }
        catch (error) {
            console.error('Error en addProduct:', error);
            if (isConnectionError(error) && error.code === 'ECONNREFUSED') {
                return res.status(503).json({
                    success: false,
                    message: 'Servicio de juegos no disponible'
                });
            }
            if (isAxiosError(error)) {
                return res.status(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500).json({
                    success: false,
                    message: ((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Error al comunicarse con IGDB'
                });
            }
            if (error instanceof Error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Error interno desconocido'
            });
        }
    }),
    getCart: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const enrichedCart = yield Promise.all(cartItems.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const gameData = yield fetchGameById(item.productId);
                    return Object.assign(Object.assign({}, item), { gameData: gameData || null });
                }
                catch (error) {
                    console.error(`Error fetching game ${item.productId}:`, error);
                    return item;
                }
            })));
            res.status(200).json(enrichedCart);
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
        try {
            const { productId } = req.params;
            const id = Number(productId);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }
            const initialLength = cartItems.length;
            cartItems = cartItems.filter(item => item.productId !== id);
            if (cartItems.length === initialLength) {
                return res.status(404).json({
                    success: false,
                    message: 'Juego no encontrado en el carrito'
                });
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
        try {
            cartItems = [];
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
