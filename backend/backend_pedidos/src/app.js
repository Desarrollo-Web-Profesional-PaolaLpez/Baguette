import 'dotenv/config'  

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'  

import { pedidosRoutes } from './rutas/pedidos.js'  
import { usuarioRoutes } from './rutas/usuarios.js'

// Crear la aplicación Express
const app = express()

// Middlewares
app.use(cors())
app.use(express.json())         // Reemplaza body-parser
app.use(express.urlencoded({ extended: true })) // Para formularios urlencoded

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://isapaola188_db_user:TG3vgeOb8KdHA9T3@cluster0.fm6myjp.mongodb.net/?appName=Cluster0'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB exitosamente')
    console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? '✓ Configurado' : '✗ No configurado')
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err.message)
    process.exit(1) 
  })

// Rutas
pedidosRoutes(app)
usuarioRoutes(app)

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Hola from Express!')
})

const PORT = process.env.PORT || 3001

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  })
}

export { app }