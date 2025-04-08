import { Router } from 'express';
import { getCart, addProductToCart, clearCart, processPayment } from '../controllers/cartController';
const router = Router(); // Esto es correcto
// Definir las rutas del carrito
router.get('/', (req, res) => {
    getCart(req, res); // Asegúrate de que se llame correctamente a los controladores
});
router.post('/add', (req, res) => {
    addProductToCart(req, res);
});
router.post('/clear', (req, res) => {
    clearCart(req, res);
});
router.post('/payment', (req, res) => {
    processPayment(req, res);
});
export default router;
