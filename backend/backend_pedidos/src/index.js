import dotenv from 'dotenv'
dotenv.config()

import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { app } from './app.js'
import { initBaseDeDatos } from './bd/init.js'

try {
  await initBaseDeDatos()
  // Railway asigna automáticamente el puerto, usa el de ellos si existe
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.info(`🚀 Servidor ejecutandose en puerto: ${PORT}`)
  })
} catch (err) {
  console.error('❌ Error conectando a la Base de Datos:', err)
  process.exit(1)
}