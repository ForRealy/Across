import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";  // Si tienes autenticación, incluye estas rutas
import gamesRoutes from "./routes/gamesRoutes.js";  // Rutas de juegos
import cartRoutes from "./routes/cartRoutes.js";  // Rutas del carrito

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'cart-id']
};

app.use(cors(corsOptions));
app.use(express.json());

// Monta las rutas en la aplicación
app.use("/api", authRoutes);  // Si tienes autenticación, monta estas rutas
app.use("/api/games", gamesRoutes);  // Rutas de juegos
app.use("/api", cartRoutes);  // Rutas del carrito

export default app;
