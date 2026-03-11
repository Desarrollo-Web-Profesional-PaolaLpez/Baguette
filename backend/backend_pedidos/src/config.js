import dotenv from 'dotenv';
import path from 'path';

// 🔹 Cargar .env desde la raíz del proyecto, siempre
dotenv.config({ path: path.resolve('./.env') });

export const JWT_SECRET = process.env.JWT_SECRET;
export const DATABASE_URL = process.env.DATABASE_URL;
export const PORT = process.env.PORT || 3001;

console.log("JWT SECRET cargado desde config.js:", JWT_SECRET);