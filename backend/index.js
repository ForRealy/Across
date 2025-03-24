var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
const app = express();
app.use(cors());
app.use(express.json());
// Configura el pool de conexiones con tus datos de MySQL
const pool = mysql.createPool({
    host: "localhost",
    user: "usuario",
    password: "usuario",
    database: "across",
});
const saltRounds = 10;
// Endpoint para registrar usuarios
app.post("/api/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profile_name, email, password, real_name, username, biography } = req.body;
    // En un ambiente de producción NO se deben almacenar las contraseñas en texto plano.
    try {
        const hashedPassword = yield bcrypt.hash(password, saltRounds);
        const [result] = yield pool.query("INSERT INTO users (profile_name, email, password, real_name, username, biography) VALUES (?, ?, ?, ?, ?, ?)", [profile_name, email, hashedPassword, real_name, username, biography]);
        res.status(201).json({ message: "Usuario registrado correctamente", id: result.insertId });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar el usuario" });
    }
}));
// Endpoint para hacer login
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        // Se busca el usuario por username
        const [rows] = yield pool.query("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0) {
            // Si no se encuentra el usuario, se responde con error
            res.status(401).json({ error: "Credenciales inválidas" });
            return;
        }
        const user = rows[0];
        // Se compara la contraseña ingresada con el hash almacenado
        const validPassword = yield bcrypt.compare(password, user.password);
        if (!validPassword) {
            // Si la comparación falla, se responde con error
            res.status(401).json({ error: "Credenciales inválidas" });
            return;
        }
        // Si la contraseña es válida, se responde con éxito y la información del usuario
        res.json({ message: "Login exitoso", user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}));
app.listen(3001, () => {
    console.log("Servidor corriendo en el puerto 3001");
});
