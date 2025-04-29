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
import pool from "../db.js";
// Se define el número de "salt rounds" para bcrypt, determinando el coste computacional del hash.
const saltRounds = 10;
// Variable para almacenar los carritos (temporalmente)
let carts = [];
// Función para registrar un nuevo usuario.
export const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Se extraen de req.body los campos esperados para el registro del usuario.
    const { profile_name, email, password, real_name, username, biography } = req.body;
    // Se valida que los campos obligatorios estén presentes.
    if (!profile_name || !email || !password || !username) {
        res.status(400).json({ error: "Faltan datos obligatorios" });
        return;
    }
    try {
        // Se hashea la contraseña utilizando bcrypt y el coste definido en saltRounds.
        const hashedPassword = yield bcrypt.hash(password, saltRounds);
        // Se realiza una consulta SQL para insertar un nuevo usuario en la tabla 'users'.
        // Los campos opcionales (real_name y biography) se asignan a null si no se proporcionan.
        const [result] = yield pool.query("INSERT INTO users (profile_name, email, password, real_name, username, biography) VALUES (?, ?, ?, ?, ?, ?)", [
            profile_name,
            email,
            hashedPassword,
            real_name || null,
            username,
            biography || null
        ]);
        // Si la inserción es exitosa, se envía una respuesta con código 201 (creado) y se retorna el id del nuevo usuario.
        res.status(201).json({ message: "Usuario registrado", id: result.insertId });
    }
    catch (error) {
        // Se maneja el error específico de clave duplicada.
        if (error.code === "ER_DUP_ENTRY") {
            res.status(400).json({ error: "El email o username ya están en uso" });
            return;
        }
        // Para cualquier otro error, se retorna un error 500 con detalles del problema.
        res.status(500).json({ error: "Error al registrar el usuario", details: error.message });
    }
});
// Función para el login del usuario.
export const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Se extraen del cuerpo de la solicitud los campos necesarios.
    const { username, password } = req.body;
    // Se verifica que se hayan proporcionado ambos datos obligatorios.
    if (!username || !password) {
        res.status(400).json({ error: "Faltan datos obligatorios" });
        return;
    }
    try {
        // Se realiza una consulta a la base de datos para obtener el usuario que coincida con el username.
        const [rows] = yield pool.query("SELECT * FROM users WHERE username = ?", [username]);
        // Si no se encuentra ningún usuario con ese username, se devuelve un error 401.
        if (rows.length === 0) {
            res.status(401).json({ error: "Usuario no encontrado" });
            return;
        }
        const user = rows[0];
        // Se utiliza bcrypt.compare para verificar que la contraseña proporcionada coincida con la contraseña hasheada almacenada.
        const validPassword = yield bcrypt.compare(password, user.password);
        // Si la contraseña no es válida, se retorna un error 401.
        if (!validPassword) {
            res.status(401).json({ error: "Contraseña incorrecta" });
            return;
        }
        // En caso de cualquier error inesperado durante el proceso, se devuelve un error 500 con detalles.
        res.json({ message: "Login exitoso", user });
    }
    catch (error) {
        res.status(500).json({ error: "Error en el login", details: error.message });
    }
});
// Función para el logout del usuario
export const logoutUser = (req, res) => {
    const cartId = req.headers['cart-id'] || 'default';
    // Limpiar el carrito del usuario
    carts = carts.filter(c => c.id !== cartId);
    res.json({ message: "Logout exitoso" });
};
