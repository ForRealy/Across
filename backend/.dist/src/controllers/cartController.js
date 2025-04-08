// Aquí simulamos un carrito en memoria (para simplificar el ejemplo)
let carts = {}; // Guardamos el carrito por usuario (usamos userId como clave)
export const getCart = (req, res) => {
    var _a;
    const userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId; // Usamos session para obtener el userId (asegúrate de tener la sesión configurada)
    if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    const cart = carts[userId] || []; // Si no existe un carrito para el usuario, devolvemos un carrito vacío
    console.log("Carrito de usuario:", userId, cart); // Verifica el carrito
    res.status(200).json({ cart }); // Respondemos con el carrito
};
export const addProductToCart = (req, res) => {
    var _a;
    const userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId; // Obtenemos el userId desde la sesión
    if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    const { product } = req.body; // Suponemos que el cuerpo tiene un campo 'product' con el nombre del producto
    if (!product) {
        res.status(400).json({ message: "Product is required" });
        return;
    }
    // Si el carrito no existe para el usuario, lo inicializamos
    if (!carts[userId]) {
        carts[userId] = [];
    }
    carts[userId].push(product); // Agregamos el producto al carrito
    res.status(200).json({ message: "Product added to cart", cart: carts[userId] });
};
export const clearCart = (req, res) => {
    var _a;
    const userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    carts[userId] = []; // Limpiamos el carrito del usuario
    res.status(200).json({ message: "Cart cleared" });
};
export const processPayment = (req, res) => {
    var _a;
    const userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    const cart = carts[userId];
    if (!cart || cart.length === 0) {
        res.status(400).json({ message: "Cart is empty" });
        return;
    }
    // Aquí deberías integrar con una API de pagos real
    carts[userId] = []; // Vaciamos el carrito después del pago
    res.status(200).json({ message: "Payment successful", cart: [] });
};
