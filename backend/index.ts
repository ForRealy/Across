import app from "./server"; // Importa la configuración del servidor desde server.ts

const PORT = 3000; // Define el puerto en el que se ejecutará el servidor
app.listen(PORT, () => {
  console.log(`Server ON http://localhost:${PORT}`);
});