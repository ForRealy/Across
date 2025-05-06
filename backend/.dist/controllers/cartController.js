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
// Carrito en memoria (en producción usar una base de datos)
let cartItems = [];
export const cartController = {
    /**
     * Añade un producto al carrito verificando con IGDB
     */
    addProduct: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { productId } = req.body;
            // Validación básica
            if (!productId || isNaN(Number(productId))) {
                res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
                return;
            }
            // Verificar con IGDB si el juego existe
            const gameData = yield fetchGameById(Number(productId));
            if (!gameData) {
                res.status(404).json({
                    success: false,
                    message: 'Juego no encontrado en IGDB'
                });
                return;
            }
            // Buscar si el producto ya está en el carrito
            const existingItemIndex = cartItems.findIndex(item => item.productId === Number(productId));
            if (existingItemIndex >= 0) {
                // Incrementar cantidad si ya existe
                cartItems[existingItemIndex].quantity += 1;
                cartItems[existingItemIndex].addedAt = new Date();
            }
            else {
                // Añadir nuevo item al carrito
                cartItems.push({
                    productId: Number(productId),
                    quantity: 1,
                    addedAt: new Date(),
                    gameData // Almacenamos los datos del juego
                });
            }
            res.status(200).json({
                success: true,
                message: 'Juego añadido al carrito',
                game: gameData,
                cart: cartItems
            });
        }
        catch (error) {
            next(error); // Pasa el error al middleware de errores
        }
    }),
    /**
     * Obtiene todos los items del carrito
     */
    getCart: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Enriquecer los items con datos actualizados de IGDB
            const enrichedCart = yield Promise.all(cartItems.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const gameData = yield fetchGameById(item.productId);
                    return Object.assign(Object.assign({}, item), { gameData: gameData || null });
                }
                catch (error) {
                    console.error(`Error fetching game ${item.productId}:`, error);
                    return item; // Mantenemos el item aunque falle la actualización
                }
            })));
            res.status(200).json(enrichedCart);
        }
        catch (error) {
            next(error);
        }
    }),
    /**
     * Elimina un producto del carrito
     */
    removeProduct: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { productId } = req.params;
            if (!productId || isNaN(Number(productId))) {
                res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
                return;
            }
            const initialCount = cartItems.length;
            cartItems = cartItems.filter(item => item.productId !== Number(productId));
            if (cartItems.length === initialCount) {
                res.status(404).json({
                    success: false,
                    message: 'Juego no encontrado en el carrito'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Juego eliminado del carrito',
                cart: cartItems
            });
        }
        catch (error) {
            next(error);
        }
    }),
    /**
     * Vacía el carrito completamente
     */
    clearCart: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            cartItems = [];
            res.status(200).json({
                success: true,
                message: 'Carrito vaciado con éxito'
            });
        }
        catch (error) {
            next(error);
        }
    })
};
