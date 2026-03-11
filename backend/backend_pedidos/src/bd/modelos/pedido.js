import mongoose, { Schema } from "mongoose";

/**
 * @typedef {Object} Pedido
 * @property {Schema.Types.ObjectId} cliente - Referencia al usuario cliente (requerido)
 * @property {string} nombre - Nombre del cliente
 * @property {string} telefono - Teléfono del cliente (10 dígitos)
 * @property {string} direccion - Dirección del cliente
 * @property {Date} fecha_solicitud - Fecha de solicitud del pedido
 * @property {Date} fecha_envio - Fecha de envío del pedido
 * @property {number} total - Total del pedido (por defecto 0.0)
 * @property {string[]} pagado - Lista de métodos de pago utilizados
 * @property {number} abono - Monto abonado al pedido
 * @property {string} comentario - Comentarios adicionales sobre el pedido
 */
const pedidoSchema = new Schema(
  {
    cliente: { type: Schema.Types.ObjectId, ref: 'usuario', required: true },
    nombre: { type: String, required: true },
    telefono: { type: String, required: true, minlength: 10, maxlength: 10 },
    direccion: { type: String, required: true },
    fecha_solicitud: { type: Date, required: true },
    fecha_envio: { type: Date, required: true },
    total: { type: Number, default: 0.0 },
    pagado: [String],
    abono: { type: Number, default: 0.0 },
    comentario: { type: String },
  },
  { timestamps: true },
);

export const Pedido = mongoose.model('Pedido', pedidoSchema);