import { Router } from "express";
import { getCart, addToCart } from "../controllers/cartController";

const router = Router();

// Ruta para obtener el carrito
router.get("/cart", getCart);

// Ruta para añadir al carrito
router.post("/cart", addToCart);

export default router;