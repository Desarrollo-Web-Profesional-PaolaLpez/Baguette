import mongoose, { Schema } from "mongoose";

/**
 * @typedef {Object} Pedido
 * @property {Schema.Types.ObjectId} cliente - Referencia opcional al usuario cliente
 * @property {string} nombre - Nombre del cliente
 * @property {string} telefono - Teléfono del cliente (10 dígitos)
 * @property {string} direccion - Dirección del cliente
 * @property {Date} fecha_solicitud - Fecha de solicitud del pedido (se genera automáticamente)
 * @property {Date} fecha_envio - Fecha de envío del pedido
 * @property {number} total - Total del pedido (por defecto 0.0)
 * @property {string[]} pagado - Métodos de pago utilizados
 * @property {number} abono - Monto abonado al pedido
 * @property {string} comentario - Comentarios adicionales sobre el pedido
 */

const pedidoSchema = new Schema(
  {
    // Referencia opcional a usuario
    cliente: {
      type: Schema.Types.ObjectId,
      ref: "usuario",
    },

    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    telefono: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10,
    },

    direccion: {
      type: String,
      required: true,
      trim: true,
    },

    fecha_solicitud: {
      type: Date,
      default: Date.now,
    },

    fecha_envio: {
      type: Date,
      required: true,
    },

    total: {
      type: Number,
      default: 0.0,
    },

    pagado: {
      type: [String],
      enum: ["Efectivo", "Transferencia", "Tarjeta", "Depósito"],
      default: [],
    },

    abono: {
      type: Number,
      default: 0.0,
    },

    comentario: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Pedido = mongoose.model("Pedido", pedidoSchema);