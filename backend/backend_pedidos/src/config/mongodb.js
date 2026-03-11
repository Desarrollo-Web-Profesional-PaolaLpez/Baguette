
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para rutas en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
    try {
        // Verificar que DATABASE_URL existe
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL no está definida en el archivo .env');
        }

        console.log('🔄 Conectando a MongoDB...');
        console.log('📊 Base de datos:', process.env.DATABASE_URL);

        const conn = await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
        console.log(`📚 Base de datos: ${conn.connection.name}`);
        
        return conn;
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;