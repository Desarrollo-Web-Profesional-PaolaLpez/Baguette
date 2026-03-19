import { useState, useEffect } from "react";
import API from "../servicios/api";
import { 
  FaBox, FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, 
  FaMoneyBillWave, FaEdit, FaTrash, FaSearch, FaPlus, 
  FaCheckCircle, FaClock, FaComment
} from "react-icons/fa";
import "../index.css";

function PedidoForm() {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    fecha_solicitud: "",
    fecha_envio: "",
    total: "",
    abono: "",
    pagado: [],
    comentario: ""
  });

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [showForm, setShowForm] = useState(false);

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const res = await API.get("/");

      // Asegurarse de que siempre sea un array
      const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.data) ? res.data.data : []);
      setPedidos(data);

    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      alert("❌ Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePagadoChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setForm({ ...form, pagado: [...form.pagado, value] });
    } else {
      setForm({ ...form, pagado: form.pagado.filter((m) => m !== value) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...form,
        fecha_solicitud: form.fecha_solicitud
          ? new Date(form.fecha_solicitud).toISOString()
          : new Date().toISOString(),
        fecha_envio: new Date(form.fecha_envio).toISOString(),
        total: form.total ? parseFloat(form.total) : 0,
        abono: form.abono ? parseFloat(form.abono) : 0
      };

      if (editingId) {
        await API.put(`/${editingId}`, payload);
        alert("✅ Pedido actualizado correctamente");
      } else {
        await API.post("/", payload);
        alert("✅ Pedido guardado correctamente");
      }

      resetForm();
      cargarPedidos();
      setShowForm(false);

    } catch (error) {
      console.error(error.response || error);
      alert("❌ Error al guardar el pedido");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pedido) => {
    setForm({
      ...pedido,
      fecha_solicitud: pedido.fecha_solicitud ? pedido.fecha_solicitud.split('T')[0] : "",
      fecha_envio: pedido.fecha_envio ? pedido.fecha_envio.split('T')[0] : "",
      total: pedido.total?.toString() || "0",
      abono: pedido.abono?.toString() || "0",
      pagado: Array.isArray(pedido.pagado) ? pedido.pagado : []
    });
    setEditingId(pedido._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este pedido?")) {
      try {
        await API.delete(`/${id}`);
        alert("✅ Pedido eliminado correctamente");
        cargarPedidos();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("❌ Error al eliminar el pedido");
      }
    }
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      telefono: "",
      direccion: "",
      fecha_solicitud: "",
      fecha_envio: "",
      total: "",
      abono: "",
      pagado: [],
      comentario: ""
    });
    setEditingId(null);
  };

  // Filtrar pedidos con seguridad
  const pedidosFiltrados = Array.isArray(pedidos)
    ? pedidos.filter(pedido => {
        const matchesSearch =
          pedido.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pedido.telefono?.includes(searchTerm);

        if (filterStatus === "todos") return matchesSearch;
        if (filterStatus === "pagado") return Array.isArray(pedido.pagado) && pedido.pagado.length > 0;
        if (filterStatus === "pendiente") return Array.isArray(pedido.pagado) && pedido.pagado.length === 0;

        return matchesSearch;
      })
    : [];

  const calcularSaldo = (total, abono) => (total || 0) - (abono || 0);

  const getStatusColor = (pagado, total, abono) => {
    if (!Array.isArray(pagado) || pagado.length === 0) return "bg-yellow-100 text-yellow-800";
    if (calcularSaldo(total, abono) <= 0) return "bg-green-100 text-green-800";
    return "bg-blue-100 text-blue-800";
  };

  const getStatusText = (pagado, total, abono) => {
    if (!Array.isArray(pagado) || pagado.length === 0) return "Pendiente";
    if (calcularSaldo(total, abono) <= 0) return "Pagado";
    return "Abonado";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <FaBox className="text-4xl text-blue-300" />
              <h1 className="text-3xl font-bold text-white">Gestión de Pedidos</h1>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <FaPlus />
              <span>{showForm ? "Cancelar" : "Nuevo Pedido"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Formulario */}
        {showForm && (
          <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? "✏️ Editar Pedido" : "📦 Nuevo Pedido"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nombre */}
                <div>
                  <label className="block text-white font-medium mb-2 flex items-center">
                    <FaUser className="mr-2" /> Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Nombre del cliente"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-white font-medium mb-2 flex items-center">
                    <FaPhone className="mr-2" /> Teléfono
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    maxLength="10"
                    required
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Número telefónico"
                  />
                </div>

                {/* Dirección */}
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2 flex items-center">
                    <FaMapMarkerAlt className="mr-2" /> Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Dirección completa"
                  />
                </div>

                {/* Fechas */}
                <div>
                  <label className="block text-white font-medium mb-2 flex items-center">
                    <FaCalendarAlt className="mr-2" /> Fecha Solicitud
                  </label>
                  <input
                    type="date"
                    name="fecha_solicitud"
                    value={form.fecha_solicitud}
                    onChange={handleChange}
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2 flex items-center">
                    <FaClock className="mr-2" /> Fecha Envío
                  </label>
                  <input
                    type="date"
                    name="fecha_envio"
                    value={form.fecha_envio}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* Montos */}
                <div>
                  <label className="block text-white font-medium mb-2 flex items-center">
                    <FaMoneyBillWave className="mr-2" /> Total ($)
                  </label>
                  <input
                    type="number"
                    name="total"
                    value={form.total}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2 flex items-center">
                    <FaMoneyBillWave className="mr-2" /> Abono ($)
                  </label>
                  <input
                    type="number"
                    name="abono"
                    value={form.abono}
                    onChange={handleChange}
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400"
                    placeholder="0.00"
                  />
                </div>

                {/* Métodos de Pago */}
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2">Métodos de Pago</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Efectivo", "Transferencia", "Tarjeta", "Depósito"].map((metodo) => (
                      <label
                        key={metodo}
                        className={`flex items-center space-x-2 p-3 rounded-xl cursor-pointer transition-all ${
                          form.pagado.includes(metodo)
                            ? "bg-blue-500 text-white"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={metodo}
                          checked={form.pagado.includes(metodo)}
                          onChange={handlePagadoChange}
                          className="hidden"
                        />
                        <FaCheckCircle className={form.pagado.includes(metodo) ? "opacity-100" : "opacity-0"} />
                        <span>{metodo}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Comentario */}
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2 flex items-center">
                    <FaComment className="mr-2" /> Comentario
                  </label>
                  <textarea
                    name="comentario"
                    value={form.comentario}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400"
                    placeholder="Comentarios adicionales..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(false); }}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Guardando..." : editingId ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Barra de búsqueda y filtros */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-blue-400"
          >
            <option value="todos">Todos los pedidos</option>
            <option value="pagado">Pagados</option>
            <option value="pendiente">Pendientes</option>
          </select>
        </div>

        {/* Lista de pedidos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            <p className="text-white mt-4">Cargando pedidos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pedidosFiltrados.map((pedido) => (
              <div
                key={pedido._id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400 transition-all transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{pedido.nombre}</h3>
                    <p className="text-blue-300 flex items-center mt-1">
                      <FaPhone className="mr-2 text-sm" /> {pedido.telefono}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(pedido.pagado, pedido.total, pedido.abono)}`}>
                    {getStatusText(pedido.pagado, pedido.total, pedido.abono)}
                  </span>
                </div>

                <div className="space-y-2 text-white/80">
                  <p className="flex items-start">
                    <FaMapMarkerAlt className="mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm">{pedido.direccion}</span>
                  </p>
                  
                  <div className="flex justify-between text-sm">
                    <span>Total: ${pedido.total}</span>
                    <span>Abono: ${pedido.abono}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Saldo:</span>
                    <span className={calcularSaldo(pedido.total, pedido.abono) > 0 ? "text-yellow-300" : "text-green-300"}>
                      ${calcularSaldo(pedido.total, pedido.abono)}
                    </span>
                  </div>

                  {Array.isArray(pedido.pagado) && pedido.pagado.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pedido.pagado.map((metodo, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-500/30 rounded-lg text-xs">{metodo}</span>
                      ))}
                    </div>
                  )}

                  {pedido.comentario && (
                    <p className="text-sm mt-2 italic text-white/60">💬 {pedido.comentario}</p>
                  )}
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => handleEdit(pedido)}
                    className="text-blue-500 hover:text-blue-400 transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(pedido._id)}
                    className="text-red-500 hover:text-red-400 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

            {pedidosFiltrados.length === 0 && (
              <p className="text-white col-span-full text-center mt-12">No hay pedidos que mostrar</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PedidoForm;