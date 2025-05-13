import { Request, Response } from "express";
import { fetchGameById } from "./gamesController.js";
import Cart from "../models/Cart.js";
import Download from "../models/Download.js";

export const cartController = {
  addProduct: async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    const userId = req.user?.idUser;

    if (!userId) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    if (!productId || typeof productId !== "number") {
      res.status(400).json({ success: false, message: "ID de producto inválido o faltante" });
      return;
    }

    // Verificar si el juego ya está en el carrito
    const existingCartItem = await Cart.findOne({ where: { user_id: userId, game_id: productId } });

    if (existingCartItem) {
      res.status(409).send("Este juego ya está en tu carrito"); // Debe ser send(), no json()
      return;
    }

    const gameData = await fetchGameById(productId);
    if (!gameData) {
      res.status(404).json({ success: false, message: "Juego no encontrado" });
      return;
    }

    const price = gameData.price || 59.99;

    // Agregar producto al carrito
    const cartItem = await Cart.create({ user_id: userId, game_id: productId, quantity: 1 });

    res.status(200).json({
      success: true,
      message: "Producto añadido al carrito",
      cartItem: { ...cartItem.toJSON(), gameData: { ...gameData, price } },
    });

  } catch (error) {
    console.error("Error en addProduct:", error);
    res.status(500).json({ success: false, message: "Error al añadir producto al carrito" });
  }
},

  getCart: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.idUser;

      if (!userId) {
        res.status(401).json({ success: false, message: "Usuario no autenticado" });
        return;
      }

      const cartItems = await Cart.findAll({ where: { user_id: userId } });

      const enrichedCart = await Promise.all(
        cartItems.map(async (item) => {
          const gameData = await fetchGameById(item.game_id);
          return { ...item.toJSON(), gameData: gameData ? { ...gameData, price: gameData.price || 59.99 } : null };
        })
      );

      const total = enrichedCart.reduce((sum, item) => sum + ((item.gameData?.price || 59.99) * item.quantity), 0);

      res.status(200).json({ items: enrichedCart, total: total.toFixed(2) });
    } catch (error) {
      console.error("Error getting cart:", error);
      res.status(500).json({ success: false, message: "Error al obtener el carrito" });
    }
  },

  removeProduct: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.idUser;
      const productId = Number(req.params.productId);

      if (!userId) {
        res.status(401).json({ success: false, message: "Usuario no autenticado" });
        return;
      }

      if (isNaN(productId)) {
        res.status(400).json({ success: false, message: "ID de producto inválido" });
        return;
      }

      const cartItem = await Cart.findOne({ where: { user_id: userId, game_id: productId } });

      if (!cartItem) {
        res.status(404).json({ success: false, message: "Juego no encontrado en el carrito" });
        return;
      }

      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        await cartItem.save();
      } else {
        await cartItem.destroy();
      }

      res.status(200).json({ success: true, message: "Cantidad reducida/eliminado del carrito", cartItem });
    } catch (error) {
      console.error("Error removing product:", error);
      res.status(500).json({ success: false, message: "Error al eliminar del carrito" });
    }
  },

  checkout: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.idUser;
      const { cart } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: "Usuario no autenticado" });
        return;
      }

      if (!cart || !Array.isArray(cart)) {
        res.status(400).json({ success: false, message: "Carrito inválido" });
        return;
      }

      const downloadEntries = cart.map((item) => ({
        idUser: userId,
        idGame: item.game_id,
        status: "pending",
        download_date: new Date(),
      }));

      await Download.bulkCreate(downloadEntries);
      await Cart.destroy({ where: { user_id: userId } });

      res.status(200).json({ success: true, message: "Pago realizado con éxito y juegos guardados en descargas" });
    } catch (error) {
      console.error("Error en checkout:", error);
      res.status(500).json({ success: false, message: "Error al procesar el pago" });
    }
  },

  clearCart: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.idUser;

      if (!userId) {
        res.status(401).json({ success: false, message: "Usuario no autenticado" });
        return;
      }

      await Cart.destroy({ where: { user_id: userId } });

      res.status(200).json({ success: true, message: "Carrito vaciado con éxito" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ success: false, message: "Error al vaciar el carrito" });
    }
  },
};
