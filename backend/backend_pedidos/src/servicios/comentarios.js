import { Comentario } from "../bd/modelos/comentario.js";

export async function crearComentario({ puntuacion, texto }) {
  const comentario = new Comentario({ puntuacion, texto });
  return await comentario.save();
}