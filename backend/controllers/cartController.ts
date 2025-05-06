import { Request, Response, NextFunction } from 'express';
import { fetchGameById, GameWithCover } from './gamesController.js';
import { AxiosError } from 'axios';

interface CartItem {
  productId: number;
  quantity: number;
  addedAt: Date;
  gameData?: GameWithCover;
}

let cartItems: CartItem[] = [];

// Type guards
function isConnectionError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export const cartController = {
  addProduct: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.body;

      if (!productId || typeof productId !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'ID de producto inválido o faltante'
        });
      }

      const gameData = await fetchGameById(productId);
      if (!gameData) {
        return res.status(404).json({
          success: false,
          message: 'Juego no encontrado en la base de datos'
        });
      }

      const existingItem = cartItems.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.addedAt = new Date();
      } else {
        cartItems.push({
          productId,
          quantity: 1,
          addedAt: new Date(),
          gameData
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Producto añadido al carrito',
        cartItem: {
          ...(existingItem || { productId, quantity: 1, addedAt: new Date() }),
          gameData
        }
      });

    } catch (error: unknown) {
      console.error('Error en addProduct:', error);
      
      if (isConnectionError(error) && error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          message: 'Servicio de juegos no disponible'
        });
      }

      if (isAxiosError(error)) {
        return res.status(error.response?.status || 500).json({
          success: false,
          message: error.response?.data?.message || 'Error al comunicarse con IGDB'
        });
      }

      if (error instanceof Error) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error interno desconocido'
      });
    }
  },

  getCart: async (req: Request, res: Response) => {
    try {
      const enrichedCart = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const gameData = await fetchGameById(item.productId);
            return {
              ...item,
              gameData: gameData || null
            };
          } catch (error) {
            console.error(`Error fetching game ${item.productId}:`, error);
            return item;
          }
        })
      );

      res.status(200).json(enrichedCart);
    } catch (error: unknown) {
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
      const id = Number(productId);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de producto inválido'
        });
      }

      const initialLength = cartItems.length;
      cartItems = cartItems.filter(item => item.productId !== id);

      if (cartItems.length === initialLength) {
        return res.status(404).json({
          success: false,
          message: 'Juego no encontrado en el carrito'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Juego eliminado del carrito'
      });
    } catch (error: unknown) {
      console.error('Error removing product:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar del carrito'
      });
    }
  },

  clearCart: async (req: Request, res: Response) => {
    try {
      cartItems = [];
      res.status(200).json({
        success: true,
        message: 'Carrito vaciado con éxito'
      });
    } catch (error: unknown) {
      console.error('Error clearing cart:', error);
      res.status(500).json({
        success: false,
        message: 'Error al vaciar el carrito'
      });
    }
  }
};