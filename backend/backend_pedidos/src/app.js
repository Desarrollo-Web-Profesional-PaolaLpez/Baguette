import 'dotenv/config'  
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'  

import { pedidosRoutes } from './rutas/pedidos.js'  
import { usuarioRoutes } from './rutas/usuarios.js'

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

// ✅ FORMA CORRECTA: Registrar las rutas
pedidosRoutes(app)  // Esto ya configura /api/v1/pedidos internamente
usuarioRoutes(app)  // Esto configurará /api/v1/usuarios

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