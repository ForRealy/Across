import express from 'express';
import { cartController } from '../controllers/cartController.js';

const router = express.Router();

// Ruta para obtener el carrito
router.get('/cart', cartController.getCart);

// Ruta para agregar un producto al carrito
router.post('/cart/add', cartController.addProduct);

export default router;
