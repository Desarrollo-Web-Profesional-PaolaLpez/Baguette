import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

// 🔥 Rate Limiting (10 requests por minuto por IP)
export const comentariosLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: 'Demasiadas solicitudes, intenta más tarde'
  }
});

// 🔒 Validación y sanitización
export const validarComentario = [
  body('puntuacion')
    .isInt().withMessage('La puntuación debe ser un número entero'),

  body('texto')
    .isLength({ max: 200 }).withMessage('El texto no puede exceder 200 caracteres')
    .trim()
    .escape(),

  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    next();
  }
];