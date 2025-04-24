import { Request, Response } from 'express';

interface ProductInCart {
  productId: string;
  quantity: number;
}

interface Cart {
  id: string;
  products: ProductInCart[];
}

let carts: Cart[] = [];  // Almacenamiento temporal del carrito

export const cartController = {
  addProduct: (req: Request, res: Response): void => {
    const { game } = req.body; // Nombre del juego
    const cartId = req.headers['cart-id'] || 'default'; // ID del carrito, puede ser el ID de sesión o el de usuario

    // Verifica si el carrito ya existe
    let cart = carts.find(c => c.id === cartId);
    if (!cart) {
      cart = { id: cartId.toString(), products: [] };  // Crea un carrito si no existe
      carts.push(cart);
    }

    // Verifica si el producto ya está en el carrito
    const existingProduct = cart.products.find(p => p.productId === game);
    if (existingProduct) {
      existingProduct.quantity += 1; // Si el producto está en el carrito, incrementa la cantidad
    } else {
      cart.products.push({ productId: game, quantity: 1 }); // Si no está, lo agrega
    }

    // Responde con el carrito actualizado
    res.status(200).json(cart);
  },

  // Aquí podrías agregar más métodos como removeProduct, clearCart, etc.
};
