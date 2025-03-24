import express, { Request, Response } from "express";
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
app.post("/api/register", async (req, res) => {
  const { profile_name, email, password, real_name, username, biography } = req.body;
  
  // En un ambiente de producción NO se deben almacenar las contraseñas en texto plano.
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

const [result]: any = await pool.query(
  "INSERT INTO users (profile_name, email, password, real_name, username, biography) VALUES (?, ?, ?, ?, ?, ?)",
  [profile_name, email, hashedPassword, real_name, username, biography]
);
    res.status(201).json({ message: "Usuario registrado correctamente", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
});

// Endpoint para hacer login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Se busca el usuario por username
    const [rows]: any = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      // Si no se encuentra el usuario, se responde con error
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const user = rows[0];

    // Se compara la contraseña ingresada con el hash almacenado
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      // Si la comparación falla, se responde con error
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    // Si la contraseña es válida, se responde con éxito y la información del usuario
    res.json({ message: "Login exitoso", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


app.listen(3001, () => {
  console.log("Servidor corriendo en el puerto 3001");
});