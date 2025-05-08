import express from 'express';
import { cartController } from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();
// Todas las rutas del carrito requieren autenticación
router.use(authenticateToken);
// Rutas del carrito
router.post('/add', cartController.addProduct);
router.get('/', cartController.getCart);
router.delete('/remove/:productId', cartController.removeProduct);
router.delete('/', cartController.clearCart);
export default router;
