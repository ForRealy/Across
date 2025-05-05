import express from "express";
import cors from "cors";
import session from "express-session"; // <-- AÑADIDO

import authRoutes from "./routes/authRoutes.js";
import gamesRoutes from "./routes/gamesRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'cart-id']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(session({
    secret: "tu_secreto_super_seguro", // Usa process.env.SECRET en producción
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // true solo si usas HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 1 día
    }
}));

// Monta las rutas
app.use("/api", authRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api", cartRoutes);

export default app;
