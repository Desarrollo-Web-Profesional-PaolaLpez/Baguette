// src/servicios/pedidos.js
import { Pedido } from "../bd/modelos/pedido.js";

/**
 * Crear un nuevo pedido
 */
export async function creaPedido({
  nombre,
  telefono,
  direccion,
  fecha_solicitud,
  fecha_envio,
  total = 0.0,
  pagado,
  abono,
  comentario,
}) {
  // Validación mínima
  if (!nombre || !telefono || !direccion || !fecha_envio) {
    throw new Error(
      "Faltan campos obligatorios: nombre, telefono, direccion o fecha_envio"
    );
  }

  const pedido = new Pedido({
    nombre,
    telefono,
    direccion,
    fecha_solicitud: fecha_solicitud || new Date(), // se genera automáticamente si no se envía
    fecha_envio,
    total,
    pagado: pagado || [],
    abono: abono || 0,
    comentario: comentario || "",
  });

  return await pedido.save();
}

/**
 * Listar pedidos con filtros y opciones
 */
export async function listaPedidos(
  query = {},
  { sortBy = "createdAt", sortOrder = "descending" } = {},
) {
  const order = sortOrder === "ascending" ? 1 : -1;
  return await Pedido.find(query).sort({ [sortBy]: order });
}

/**
 * Listar todos los pedidos
 */
export async function listaAllPedidos(opciones) {
  return await listaPedidos({}, opciones);
}

/**
 * Listar pedidos por nombre
 */
export async function listaPedidosByNombre(nombre, opciones) {
  return await listaPedidos({ nombre }, opciones);
}

/**
 * Listar pedidos por estado de pago
 */
export async function listaPedidosByPagado(pagado, opciones) {
  return await listaPedidos({ pagado }, opciones);
}

/**
 * Obtener pedido por ID
 */
export async function getPedidoById(pedidoId) {
  return await Pedido.findById(pedidoId);
}

/**
 * Modificar un pedido existente
 */
export async function modificaPedido(
  pedidoId,
  {
    nombre,
    telefono,
    direccion,
    fecha_solicitud,
    fecha_envio,
    total,
    pagado,
    abono,
    comentario,
  },
) {
  return await Pedido.findOneAndUpdate(
    { _id: pedidoId },
    {
      $set: {
        nombre,
        telefono,
        direccion,
        fecha_solicitud,
        fecha_envio,
        total,
        pagado,
        abono,
        comentario,
      },
    },
    { new: true },
  );
}

/**
 * Eliminar un pedido
 */
export async function eliminaPedido(pedidoId) {
  return await Pedido.deleteOne({ _id: pedidoId });
}