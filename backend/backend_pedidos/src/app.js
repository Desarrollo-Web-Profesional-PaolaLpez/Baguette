import 'dotenv/config'  

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'  

import { pedidosRoutes } from './rutas/pedidos.js'  
import { usuarioRoutes } from './rutas/usuarios.js'

// Crear la aplicación Express
const app = express()

// Configurar middlewares
app.use(cors())
app.use(bodyParser.json())

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pedidos'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB exitosamente')
    console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? '✓ Configurado' : '✗ No configurado')
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err.message)
    process.exit(1) 
  })

// Configurar rutas
pedidosRoutes(app)
usuarioRoutes(app)

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Hola from Express!')
})

const PORT = process.env.PORT || 3001

// Iniciar servidor SOLO si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  })
}

export { app }