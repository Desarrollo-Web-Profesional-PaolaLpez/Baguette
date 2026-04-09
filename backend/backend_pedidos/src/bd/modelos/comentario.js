import mongoose, { Schema } from "mongoose";

const comentarioSchema = new Schema(
  {
    puntuacion: { type: Number, required: true },
    texto: { type: String, required: true, maxlength: 200 }
  },
  { timestamps: true }
);

export const Comentario = mongoose.model('comentario', comentarioSchema);