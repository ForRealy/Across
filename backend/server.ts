import express from "express";
import cors from "cors";
import session from "express-session"; // <-- AÑADIDO

import authRoutes from "./routes/authRoutes.js";
import gamesRoutes from "./routes/gamesRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import downloadsRoutes from "./routes/downloadsRoutes.js";

const app = express();

const corsOptions = {
    origin: true, // Permitir todos los orígenes en desarrollo
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'cart-id', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Configurar CORS antes de otras middleware
app.use(cors(corsOptions));
app.use(express.json());

// Configurar las cookies de sesión
app.use(session({
    secret: "tu_secreto_super_seguro",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 // 1 día
    }
}));

// Monta las rutas
app.use("/api", authRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", reviewRoutes);
app.use("/api/downloads", downloadsRoutes);

export default app;
