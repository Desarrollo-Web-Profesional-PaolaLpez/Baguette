import { useState, useEffect } from "react";
import axios from "axios";
import API from "../servicios/api";
import { 
  FaBox, FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, 
  FaMoneyBillWave, FaEdit, FaTrash, FaSearch, FaPlus, 
  FaCheckCircle, FaClock, FaComment, FaFilter, 
  FaTimes, FaSave, FaUndo, FaEye, FaChartLine
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
  const [stats, setStats] = useState({
    totalPedidos: 0,
    totalPagados: 0,
    totalPendientes: 0,
    totalIngresos: 0
  });

  // URL base de la API
  const API_URL = 'https://baguette-production-6565.up.railway.app/api/v1';

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, []);

  // Calcular estadísticas cuando cambian los pedidos
  useEffect(() => {
    if (pedidos.length > 0) {
      const totalPagados = pedidos.filter(p => p.pagado?.length > 0).length;
      const totalPendientes = pedidos.filter(p => !p.pagado || p.pagado.length === 0).length;
      const totalIngresos = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
      
      setStats({
        totalPedidos: pedidos.length,
        totalPagados,
        totalPendientes,
        totalIngresos
      });
    }
  }, [pedidos]);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/pedidos`);
      const data = Array.isArray(res.data) ? res.data : [];
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
        nombre: form.nombre,
        telefono: form.telefono,
        direccion: form.direccion,
        fecha_solicitud: form.fecha_solicitud
          ? new Date(form.fecha_solicitud).toISOString()
          : new Date().toISOString(),
        fecha_envio: new Date(form.fecha_envio).toISOString(),
        total: parseFloat(form.total) || 0,
        abono: parseFloat(form.abono) || 0,
        pagado: form.pagado,
        comentario: form.comentario || ""
      };

      if (editingId) {
        await axios.patch(`${API_URL}/pedidos/${editingId}`, payload);
        alert("✅ Pedido actualizado correctamente");
      } else {
        await axios.post(`${API_URL}/pedidos`, payload);
        alert("✅ Pedido guardado correctamente");
      }

      resetForm();
      cargarPedidos();
      setShowForm(false);

    } catch (error) {
      console.error("Error al guardar:", error);
      alert("❌ Error al guardar el pedido");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pedido) => {
    setForm({
      nombre: pedido.nombre || "",
      telefono: pedido.telefono || "",
      direccion: pedido.direccion || "",
      fecha_solicitud: pedido.fecha_solicitud ? pedido.fecha_solicitud.split('T')[0] : "",
      fecha_envio: pedido.fecha_envio ? pedido.fecha_envio.split('T')[0] : "",
      total: pedido.total?.toString() || "0",
      abono: pedido.abono?.toString() || "0",
      pagado: Array.isArray(pedido.pagado) ? pedido.pagado : [],
      comentario: pedido.comentario || ""
    });
    setEditingId(pedido._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este pedido?")) {
      try {
        await axios.delete(`${API_URL}/pedidos/${id}`);
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

  // Filtrar pedidos - CORREGIDO para que funcione correctamente
  const pedidosFiltrados = Array.isArray(pedidos)
    ? pedidos.filter(pedido => {
        // Filtro por búsqueda
        const matchesSearch = searchTerm === "" || 
          (pedido.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (pedido.telefono || '').includes(searchTerm);

        if (!matchesSearch) return false;

        // Filtro por estado
        if (filterStatus === "todos") return true;
        if (filterStatus === "pagado") {
          // Un pedido está pagado si tiene métodos de pago Y el saldo es <= 0
          const tieneMetodosPago = pedido.pagado && pedido.pagado.length > 0;
          const saldo = (pedido.total || 0) - (pedido.abono || 0);
          return tieneMetodosPago && saldo <= 0;
        }
        if (filterStatus === "pendiente") {
          // Un pedido está pendiente si NO tiene métodos de pago O tiene saldo > 0
          const noTieneMetodosPago = !pedido.pagado || pedido.pagado.length === 0;
          const saldoPendiente = (pedido.total || 0) - (pedido.abono || 0) > 0;
          return noTieneMetodosPago || saldoPendiente;
        }
        if (filterStatus === "abonado") {
          // Un pedido está abonado si tiene métodos de pago Y saldo > 0
          const tieneMetodosPago = pedido.pagado && pedido.pagado.length > 0;
          const saldoPendiente = (pedido.total || 0) - (pedido.abono || 0) > 0;
          return tieneMetodosPago && saldoPendiente;
        }
        return true;
      })
    : [];

  const calcularSaldo = (total, abono) => (total || 0) - (abono || 0);

  const getStatusColor = (pagado, total, abono) => {
    const saldo = calcularSaldo(total, abono);
    if (!pagado || pagado.length === 0 || saldo > 0) {
      if (saldo > 0 && pagado?.length > 0) return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
      return "bg-gradient-to-r from-yellow-500 to-amber-500 text-white";
    }
    if (saldo <= 0) return "bg-gradient-to-r from-emerald-500 to-green-500 text-white";
    return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
  };

  const getStatusText = (pagado, total, abono) => {
    const saldo = calcularSaldo(total, abono);
    if (!pagado || pagado.length === 0) return "Pendiente";
    if (saldo <= 0) return "Pagado";
    return "Abonado";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      
      {/* Header con efecto glassmorphism */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <FaBox className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Gestión de Pedidos
                </h1>
                <p className="text-blue-200 text-sm">Administra tus pedidos de forma profesional</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
              <span>{showForm ? "Cancelar" : "Nuevo Pedido"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Total Pedidos</p>
                <p className="text-3xl font-bold text-white">{stats.totalPedidos}</p>
              </div>
              <div className="bg-blue-500/30 p-3 rounded-xl">
                <FaBox className="text-2xl text-blue-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Pagados</p>
                <p className="text-3xl font-bold text-white">{stats.totalPagados}</p>
              </div>
              <div className="bg-green-500/30 p-3 rounded-xl">
                <FaCheckCircle className="text-2xl text-green-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-yellow-400 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Pendientes</p>
                <p className="text-3xl font-bold text-white">{stats.totalPendientes}</p>
              </div>
              <div className="bg-yellow-500/30 p-3 rounded-xl">
                <FaClock className="text-2xl text-yellow-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Ingresos Totales</p>
                <p className="text-3xl font-bold text-white">${stats.totalIngresos}</p>
              </div>
              <div className="bg-purple-500/30 p-3 rounded-xl">
                <FaChartLine className="text-2xl text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Formulario con animación */}
        {showForm && (
          <div className="mb-8 bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              {editingId ? (
                <>
                  <FaEdit className="mr-3 text-blue-400" />
                  Editar Pedido
                </>
              ) : (
                <>
                  <FaPlus className="mr-3 text-green-400" />
                  Nuevo Pedido
                </>
              )}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Campos del formulario con diseño mejorado */}
                <div className="group">
                  <label className="block text-white/80 font-medium mb-2 flex items-center text-sm">
                    <FaUser className="mr-2 text-blue-400" /> Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="group">
                  <label className="block text-white/80 font-medium mb-2 flex items-center text-sm">
                    <FaPhone className="mr-2 text-blue-400" /> Teléfono
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    maxLength="10"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Ej: 4181234567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/80 font-medium mb-2 flex items-center text-sm">
                    <FaMapMarkerAlt className="mr-2 text-blue-400" /> Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Dirección completa"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-2 flex items-center text-sm">
                    <FaCalendarAlt className="mr-2 text-blue-400" /> Fecha Solicitud
                  </label>
                  <input
                    type="date"
                    name="fecha_solicitud"
                    value={form.fecha_solicitud}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-2 flex items-center text-sm">
                    <FaClock className="mr-2 text-blue-400" /> Fecha Envío
                  </label>
                  <input
                    type="date"
                    name="fecha_envio"
                    value={form.fecha_envio}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-2 flex items-center text-sm">
                    <FaMoneyBillWave className="mr-2 text-blue-400" /> Total ($)
                  </label>
                  <input
                    type="number"
                    name="total"
                    value={form.total}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-2 flex items-center text-sm">
                    <FaMoneyBillWave className="mr-2 text-blue-400" /> Abono ($)
                  </label>
                  <input
                    type="number"
                    name="abono"
                    value={form.abono}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/80 font-medium mb-2 text-sm">Métodos de Pago</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Efectivo", "Transferencia", "Tarjeta", "Depósito"].map((metodo) => (
                      <label
                        key={metodo}
                        className={`flex items-center justify-center space-x-2 p-3 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                          form.pagado.includes(metodo)
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                            : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
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

                <div className="md:col-span-2">
                  <label className="block text-white/80 font-medium mb-2 flex items-center text-sm">
                    <FaComment className="mr-2 text-blue-400" /> Comentario
                  </label>
                  <textarea
                    name="comentario"
                    value={form.comentario}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Comentarios adicionales..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(false); }}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all flex items-center space-x-2 border border-white/10"
                >
                  <FaTimes />
                  <span>Cancelar</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <FaSave />
                      <span>{editingId ? "Actualizar" : "Guardar"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Barra de búsqueda y filtros mejorada */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="todos" className="bg-gray-800">📋 Todos los pedidos</option>
                <option value="pagado" className="bg-gray-800">✅ Pagados</option>
                <option value="abonado" className="bg-gray-800">💰 Abonados</option>
                <option value="pendiente" className="bg-gray-800">⏳ Pendientes</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("todos");
              }}
              className="px-4 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/10"
              title="Limpiar filtros"
            >
              <FaUndo />
            </button>
          </div>
        </div>

        {/* Lista de pedidos con diseño de tarjetas mejorado */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-white mt-4 text-lg">Cargando pedidos...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-white/70">
                Mostrando <span className="text-white font-bold">{pedidosFiltrados.length}</span> de <span className="text-white font-bold">{pedidos.length}</span> pedidos
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => cargarPedidos()}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all text-sm flex items-center gap-2"
                >
                  <FaUndo className="text-xs" />
                  Actualizar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pedidosFiltrados.map((pedido) => (
                <div
                  key={pedido._id}
                  className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400 transition-all transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                        {pedido.nombre}
                      </h3>
                      <p className="text-blue-300/70 flex items-center mt-1 text-sm">
                        <FaPhone className="mr-2 text-xs" /> {pedido.telefono}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${getStatusColor(pedido.pagado, pedido.total, pedido.abono)}`}>
                      {getStatusText(pedido.pagado, pedido.total, pedido.abono)}
                    </span>
                  </div>

                  <div className="space-y-3 text-white/80">
                    <p className="flex items-start text-sm">
                      <FaMapMarkerAlt className="mr-2 mt-1 flex-shrink-0 text-blue-400" />
                      <span className="line-clamp-2">{pedido.direccion}</span>
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm bg-white/5 rounded-xl p-3">
                      <div>
                        <p className="text-blue-300/70 text-xs">Total</p>
                        <p className="font-bold text-white">${pedido.total}</p>
                      </div>
                      <div>
                        <p className="text-blue-300/70 text-xs">Abono</p>
                        <p className="font-bold text-white">${pedido.abono}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                      <span className="text-sm text-blue-300/70">Saldo:</span>
                      <span className={`font-bold text-lg ${
                        calcularSaldo(pedido.total, pedido.abono) > 0 
                          ? "text-yellow-400" 
                          : "text-green-400"
                      }`}>
                        ${calcularSaldo(pedido.total, pedido.abono)}
                      </span>
                    </div>

                    {Array.isArray(pedido.pagado) && pedido.pagado.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pedido.pagado.map((metodo, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-lg text-xs text-white/90 border border-white/10"
                          >
                            {metodo}
                          </span>
                        ))}
                      </div>
                    )}

                    {pedido.comentario && (
                      <p className="text-sm mt-2 italic text-white/50 line-clamp-2 border-t border-white/10 pt-2">
                        💬 {pedido.comentario}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(pedido)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-white/5 rounded-lg transition-all"
                      title="Editar"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(pedido._id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}

              {pedidosFiltrados.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 inline-block">
                    <FaBox className="text-6xl text-blue-400/50 mx-auto mb-4" />
                    <p className="text-white/70 text-lg">No hay pedidos que mostrar</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all inline-flex items-center gap-2"
                    >
                      <FaPlus />
                      Crear primer pedido
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PedidoForm;