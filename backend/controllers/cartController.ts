import { Request, Response } from 'express';
import { fetchGameById, GameWithCover } from './gamesController.js';
import Cart from '../models/Cart.js';

export const cartController = {
  addProduct: async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const userId = req.user?.idUser;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!productId || typeof productId !== 'number') {
        res.status(400).json({
          success: false,
          message: 'ID de producto inválido o faltante'
        });
        return;
      }

      // Fetch game data from IGDB
      const gameData = await fetchGameById(productId);
      if (!gameData) {
        res.status(404).json({
          success: false,
          message: 'Juego no encontrado'
        });
        return;
      }

      // Set a default price if not provided by IGDB
      const price = gameData.price || 59.99;

      // Check if the product is already in the cart
      const [cartItem, created] = await Cart.findOrCreate({
        where: {
          user_id: userId,
          game_id: productId
        },
        defaults: {
          quantity: 1
        }
      });

      if (!created) {
        // If the product already exists, increment the quantity
        cartItem.quantity += 1;
        await cartItem.save();
      }

      res.status(200).json({
        success: true,
        message: 'Producto añadido al carrito',
        cartItem: {
          ...cartItem.toJSON(),
          gameData: {
            ...gameData,
            price
          }
        }
      });

    } catch (error) {
      console.error('Error en addProduct:', error);
      res.status(500).json({
        success: false,
        message: 'Error al añadir producto al carrito'
      });
    }
  },

  getCart: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.idUser;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const cartItems = await Cart.findAll({
        where: { user_id: userId }
      });

      const enrichedCart = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const gameData = await fetchGameById(item.game_id);
            if (!gameData) {
              return {
                ...item.toJSON(),
                gameData: null
              };
            }
            return {
              ...item.toJSON(),
              gameData: {
                ...gameData,
                price: gameData.price || 59.99
              }
            };
          } catch (error) {
            console.error(`Error fetching game ${item.game_id}:`, error);
            return item.toJSON();
          }
        })
      );

      // Calculate total
      const total = enrichedCart.reduce((sum, item) => {
        const price = item.gameData?.price || 59.99;
        return sum + (price * item.quantity);
      }, 0);

      res.status(200).json({
        items: enrichedCart,
        total: total.toFixed(2)
      });
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el carrito'
      });
    }
  },

  removeProduct: async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.idUser;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const id = Number(productId);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'ID de producto inválido'
      });
      return;
    }

    // Buscar el producto en el carrito
    const cartItem = await Cart.findOne({
      where: {
        user_id: userId,
        game_id: id
      }
    });

    if (!cartItem) {
      res.status(404).json({
        success: false,
        message: 'Juego no encontrado en el carrito'
      });
      return;
    }

    // Si hay más de uno, reducir la cantidad en uno
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await cartItem.save();
    } else {
      // Si solo hay uno, eliminar el producto completamente
      await cartItem.destroy();
    }

    res.status(200).json({
      success: true,
      message: 'Cantidad reducida/eliminado del carrito',
      cartItem
    });

  } catch (error) {
    console.error('Error removing product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar del carrito'
    });
  }
},

  clearCart: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.idUser;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      await Cart.destroy({
        where: { user_id: userId }
      });

      res.status(200).json({
        success: true,
        message: 'Carrito vaciado con éxito'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error al vaciar el carrito'
      });
    }
  }
};