let carts = [];
export const cartController = {
    createCart: (req, res) => {
        const newCart = {
            id: Date.now().toString(),
            products: []
        };
        carts.push(newCart);
        res.status(201).json(newCart);
    },
    getCart: (req, res) => {
        const { cid } = req.params;
        const cart = carts.find(c => c.id === cid);
        if (!cart) {
            res.status(404).json({ error: 'Carrito no encontrado' });
            return;
        }
        res.json(cart);
    },
    addProduct: (req, res) => {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        const cartIndex = carts.findIndex(c => c.id === cid);
        if (cartIndex === -1) {
            res.status(404).json({ error: 'Carrito no encontrado' });
            return;
        }
        const productIndex = carts[cartIndex].products.findIndex(p => p.productId === pid);
        if (productIndex !== -1) {
            carts[cartIndex].products[productIndex].quantity += quantity || 1;
        }
        else {
            carts[cartIndex].products.push({
                productId: pid,
                quantity: quantity || 1
            });
        }
        res.json(carts[cartIndex]);
    },
    removeProduct: (req, res) => {
        const { cid, pid } = req.params;
        const cartIndex = carts.findIndex(c => c.id === cid);
        if (cartIndex === -1) {
            res.status(404).json({ error: 'Carrito no encontrado' });
            return;
        }
        carts[cartIndex].products = carts[cartIndex].products.filter(p => p.productId !== pid);
        res.json(carts[cartIndex]);
    },
    clearCart: (req, res) => {
        const { cid } = req.params;
        const cartIndex = carts.findIndex(c => c.id === cid);
        if (cartIndex === -1) {
            res.status(404).json({ error: 'Carrito no encontrado' });
            return;
        }
        carts[cartIndex].products = [];
        res.json(carts[cartIndex]);
    }
};
