import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
// Obtener el directorio actual en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: resolve(__dirname, '../.env') });
if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
    console.error('Error: TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET deben estar definidos en el archivo .env');
    process.exit(1);
}
export const config = {
    twitchClientId: process.env.TWITCH_CLIENT_ID,
    twitchClientSecret: process.env.TWITCH_CLIENT_SECRET
};
