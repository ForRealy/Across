import express from 'express';
import { cartController } from '../controllers/cartController';
const router = express.Router();
// Crear un nuevo carrito
router.post('/cart', cartController.createCart);
// Obtener un carrito por ID
router.get('/cart/:cid', cartController.getCart);
// Añadir un producto al carrito
router.post('/cart/:cid/products/:pid', cartController.addProduct);
// Eliminar un producto del carrito
router.delete('/cart/:cid/products/:pid', cartController.removeProduct);
// Vaciar el carrito
router.delete('/cart/:cid', cartController.clearCart);
export default router;
