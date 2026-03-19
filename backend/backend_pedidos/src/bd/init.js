import mongoose from "mongoose";
import dns from 'dns';

// Forzar IPv4 para evitar problemas de resolución DNS
dns.setDefaultResultOrder('ipv4first');

// Define una función para inicializar la conexión a la base de datos
export async function initBaseDeDatos() {
  // Usa MONGODB_URI que es lo que tienes en .env
  const DATABASE_URL = process.env.MONGODB_URI;
  
  if (!DATABASE_URL) {
    throw new Error('MONGODB_URI no está definida en el archivo .env');
  }

  console.log('🔄 Intentando conectar a MongoDB...');

  // Configura los eventos de conexión de Mongoose
  mongoose.connection.on("error", (error) => {
    console.error("❌ Error de conexión a la Base de Datos:", error);
  });

  // Evento para cuando la conexión se abre exitosamente
  mongoose.connection.once("open", () => {
    console.info("✅ Exitosamente Conectado a la Base de Datos");
  });

  // Evento para cuando se desconecta
  mongoose.connection.on("disconnected", () => {
    console.log("🔴 Desconectado de MongoDB");
  });

  // Manejar cierre graceful
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔴 Conexión cerrada por terminación de la aplicación');
    process.exit(0);
  });

  try {
    // Verifica si ya hay conexión activa
    if (mongoose.connection.readyState === 0) {
      // Opciones de conexión para mejor compatibilidad
      const opcionesConexion = {
        serverSelectionTimeoutMS: 5000, // Timeout después de 5 segundos
        socketTimeoutMS: 45000, // Cerrar sockets después de 45 segundos de inactividad
        family: 4 // Forzar IPv4
      };

      // Inicia la conexión a la base de datos
      await mongoose.connect(DATABASE_URL, opcionesConexion);
      console.log("🟢 Conexión establecida con MongoDB");
    } else {
      console.log("🟢 Usando conexión existente de MongoDB, estado:", 
        ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]);
    }
    
    return mongoose.connection;
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:");
    console.error("   - Nombre:", error.name);
    console.error("   - Mensaje:", error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error("\n🔍 Posibles soluciones:");
      console.error("   1. Verifica que tu IP (189.169.121.62) esté en MongoDB Atlas Network Access");
      console.error("   2. Espera 2-3 minutos después de agregar la IP");
      console.error("   3. Verifica tu conexión a internet");
      console.error("   4. Prueba con: mongodb://localhost:27017/pedidos (para desarrollo local)");
    }
    
    throw error;
  }
}