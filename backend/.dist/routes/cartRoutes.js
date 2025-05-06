import express from 'express';
import { cartController } from '../controllers/cartController.js'; // Nota la extensión .js
const router = express.Router();
router.post('/add', cartController.addProduct);
router.get('/', cartController.getCart);
router.delete('/remove/:productId', cartController.removeProduct);
router.delete('/', cartController.clearCart);
export default router;
