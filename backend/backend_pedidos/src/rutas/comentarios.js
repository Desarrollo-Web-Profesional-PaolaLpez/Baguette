import { crearComentario } from "../servicios/comentarios.js";
import { comentariosLimiter, validarComentario } from "../middlewares/seguridad.js";

export function comentariosRoutes(app) {

  // POST /api/v1/comentarios
  app.post(
    '/api/v1/comentarios',
    comentariosLimiter,   // 🔥 Limita peticiones
    validarComentario,    // 🔒 Valida y sanitiza
    async (req, res) => {
      try {
        const comentario = await crearComentario(req.body);
        return res.status(201).json(comentario);
      } catch (error) {
        console.error('Error creando comentario', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  );

}