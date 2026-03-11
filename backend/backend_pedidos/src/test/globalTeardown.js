/**
 * @description Archivo de configuración global para Jest, se ejecuta después de todas las pruebas
 * @author Gabriel Barrón Rodríuguez
 * @version 1.0.0
 */
export default async function globalTeardown() {
  await global.__MONGOINSTANCE.stop() // Detiene la instancia de MongoDB después de todas las pruebas
}
