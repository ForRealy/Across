var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from "bcrypt";
import pool from "../db.js"; // Conexión a la base de datos
const saltRounds = 10; // Coste del hash: 10
export const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profile_name, email, password, real_name, username, biography } = req.body;
    if (!profile_name || !email || !password || !username) {
        res.status(400).json({ error: "Faltan datos obligatorios" });
        return;
    }
    try {
        const hashedPassword = yield bcrypt.hash(password, saltRounds);
        const [result] = yield pool.query("INSERT INTO users (profile_name, email, password, real_name, username, biography) VALUES (?, ?, ?, ?, ?, ?)", [
            profile_name,
            email,
            hashedPassword,
            real_name || null,
            username,
            biography || null
        ]);
        res.status(201).json({ message: "Usuario registrado", id: result.insertId });
    }
    catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            res.status(400).json({ error: "El email o username ya están en uso" });
            return;
        }
        res.status(500).json({ error: "Error al registrar el usuario", details: error.message });
    }
});
export const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: "Faltan datos obligatorios" });
        return;
    }
    try {
        const [rows] = yield pool.query("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0) {
            res.status(401).json({ error: "Usuario no encontrado" });
            return;
        }
        const user = rows[0];
        const validPassword = yield bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ error: "Contraseña incorrecta" });
            return;
        }
        res.json({ message: "Login exitoso", user });
    }
    catch (error) {
        res.status(500).json({ error: "Error en el login", details: error.message });
    }
});
