import { Request, Response, NextFunction } from "express";

let cart: string[] = []; // Simulación de un carrito en memoria

// Obtener el carrito
export const getCart = (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.status(200).json(cart);
  } catch (error) {
    next(error); // Manejo de errores
  }
};

// Añadir al carrito
export const addToCart = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { game } = req.body;
    if (!game) {
      res.status(400).json({ message: "El nombre del juego es obligatorio." });
      return;
    }
    cart.push(game);
    res.status(201).json({ message: "Juego añadido al carrito.", cart });
  } catch (error) {
    next(error); // Manejo de errores
  }
};