import express from 'express';
import { cartController } from '../controllers/cartController.js';

const router = express.Router();

// Ruta para obtener el carrito
router.get('/cart', cartController.getCart);

// Ruta para agregar un producto al carrito
router.post('/cart/add', cartController.addProduct);

// Ruta para eliminar un producto del carrito
router.delete('/cart/remove/:productId', cartController.removeProduct);

export default router;
