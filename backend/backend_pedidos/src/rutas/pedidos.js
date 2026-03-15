// src/rutas/pedidos.js
import { Router } from 'express'
import {
  creaPedido,
  listaPedidos,
  listaAllPedidos,
  listaPedidosByNombre,
  listaPedidosByPagado,
  getPedidoById,
  modificaPedido,
  eliminaPedido
} from '../servicios/pedidos.js'

export function pedidosRoutes(app) {
  const router = Router()

  // GET pedidos (todos, por nombre o por pagado)
  router.get('/', async (req, res) => {
    try {
      const { nombre, pagado } = req.query

      if (nombre) {
        const pedidos = await listaPedidosByNombre(nombre)
        return res.json(pedidos)
      }

      if (pagado) {
        const pedidos = await listaPedidosByPagado(pagado)
        return res.json(pedidos)
      }

      const pedidos = await listaPedidos()
      res.json(pedidos)

    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al obtener pedidos' })
    }
  })

  // GET pedido por ID
  router.get('/:id', async (req, res) => {
    try {
      const pedido = await getPedidoById(req.params.id)

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido no encontrado' })
      }

      res.json(pedido)

    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al obtener pedido' })
    }
  })

  // POST crear pedido
  router.post('/', async (req, res) => {
    try {
      const { cliente, nombre, telefono, direccion, fecha_solicitud, fecha_envio, total, pagado, abono, comentario } = req.body

      // ⚠ Validar campos obligatorios
      if (!nombre || !telefono || !direccion || !fecha_envio) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, telefono, direccion o fecha_envio' })
      }

      const nuevoPedido = await creaPedido({
        cliente,
        nombre,
        telefono,
        direccion,
        fecha_solicitud,
        fecha_envio,
        total,
        pagado,
        abono,
        comentario
      })

      res.status(201).json(nuevoPedido)

    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al crear pedido', detalle: err.message })
    }
  })

  // PATCH modificar pedido
  router.patch('/:id', async (req, res) => {
    try {
      const actualizado = await modificaPedido(req.params.id, req.body)
      res.json(actualizado)

    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al modificar pedido' })
    }
  })

  // DELETE eliminar pedido
  router.delete('/:id', async (req, res) => {
    try {
      await eliminaPedido(req.params.id)
      res.status(204).send()

    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error al eliminar pedido' })
    }
  })

  app.use('/api/v1/pedidos', router)
}