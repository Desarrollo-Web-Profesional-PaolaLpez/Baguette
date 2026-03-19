import { useState, useEffect } from "react";
import axios from "axios";
import API from "../servicios/api";
import { 
  FaBox, FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, 
  FaMoneyBillWave, FaEdit, FaTrash, FaSearch, FaPlus, 
  FaCheckCircle, FaClock, FaComment, FaFilter, 
  FaTimes, FaSave, FaUndo, FaChartLine, FaHeart,
  FaStar, FaGem, FaCrown, FaSparkles, FaMagic,
  FaRegSmile, FaRegHeart, FaRegStar, FaFeather,
  FaPalette, FaPaintBrush, FaRibbon, FaGift,
  FaArrowRight, FaArrowLeft, FaCheckDouble,
  FaCreditCard, FaWallet, FaCoins, FaPercentage
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
    totalAbonados: 0,
    totalIngresos: 0
  });
  const [animateStats, setAnimateStats] = useState(false);

  // URL base de la API
  const API_URL = 'https://baguette-production-6565.up.railway.app/api/v1';

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, []);

  // Calcular estadísticas cuando cambian los pedidos
  useEffect(() => {
    if (pedidos.length > 0) {
      const totalPagados = pedidos.filter(p => {
        const saldo = (p.total || 0) - (p.abono || 0);
        return p.pagado?.length > 0 && saldo <= 0;
      }).length;
      
      const totalAbonados = pedidos.filter(p => {
        const saldo = (p.total || 0) - (p.abono || 0);
        return p.pagado?.length > 0 && saldo > 0;
      }).length;
      
      const totalPendientes = pedidos.filter(p => !p.pagado || p.pagado.length === 0).length;
      const totalIngresos = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
      
      setStats({
        totalPedidos: pedidos.length,
        totalPagados,
        totalPendientes,
        totalAbonados,
        totalIngresos
      });
      setAnimateStats(true);
      setTimeout(() => setAnimateStats(false), 1000);
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
        alert("✨ ¡Pedido actualizado con éxito!");
      } else {
        await axios.post(`${API_URL}/pedidos`, payload);
        alert("✨ ¡Pedido guardado con éxito!");
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
    
    // Scroll suave hacia el formulario
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás segura de eliminar este pedido?")) {
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

  // Filtrar pedidos mejorado
  const pedidosFiltrados = Array.isArray(pedidos)
    ? pedidos.filter(pedido => {
        const matchesSearch = searchTerm === "" || 
          (pedido.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (pedido.telefono || '').includes(searchTerm);

        if (!matchesSearch) return false;

        const saldo = (pedido.total || 0) - (pedido.abono || 0);
        const tienePago = pedido.pagado && pedido.pagado.length > 0;

        if (filterStatus === "todos") return true;
        if (filterStatus === "pagado") return tienePago && saldo <= 0;
        if (filterStatus === "abonado") return tienePago && saldo > 0;
        if (filterStatus === "pendiente") return !tienePago;
        return true;
      })
    : [];

  const calcularSaldo = (total, abono) => (total || 0) - (abono || 0);

  const getStatusColor = (pagado, total, abono) => {
    const saldo = calcularSaldo(total, abono);
    if (!pagado || pagado.length === 0) {
      return "bg-gradient-to-r from-amber-300 to-amber-400 text-amber-900";
    }
    if (saldo <= 0) {
      return "bg-gradient-to-r from-emerald-300 to-green-400 text-emerald-900";
    }
    return "bg-gradient-to-r from-blue-300 to-indigo-400 text-blue-900";
  };

  const getStatusIcon = (pagado, total, abono) => {
    const saldo = calcularSaldo(total, abono);
    if (!pagado || pagado.length === 0) return <FaClock className="mr-1" />;
    if (saldo <= 0) return <FaCheckDouble className="mr-1" />;
    return <FaStar className="mr-1" />;
  };

  const getStatusText = (pagado, total, abono) => {
    const saldo = calcularSaldo(total, abono);
    if (!pagado || pagado.length === 0) return "Pendiente";
    if (saldo <= 0) return "Pagado";
    return "Abonado";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      {/* Header con diseño femenino y elegante */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-blue-100 sticky top-0 z-50 shadow-lg shadow-blue-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-400 p-3 rounded-2xl shadow-lg shadow-blue-200">
                <FaGem className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                  Gestión de Pedidos
                  <FaSparkles className="ml-2 text-yellow-400 text-2xl" />
                </h1>
                <p className="text-indigo-400 text-sm flex items-center">
                  <FaRegHeart className="mr-1 text-pink-400" />
                  Administra tus pedidos con estilo y elegancia
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="group relative bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl shadow-blue-200"
            >
              <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
              <span>{showForm ? "Cancelar" : "Nuevo Pedido"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tarjetas de estadísticas con diseño femenino */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-blue-100 hover:border-blue-300 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl shadow-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-400 text-sm flex items-center">
                  <FaBox className="mr-1" /> Total Pedidos
                </p>
                <p className={`text-3xl font-bold text-indigo-600 ${animateStats ? 'scale-110' : ''} transition-transform`}>
                  {stats.totalPedidos}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl">
                <FaGem className="text-2xl text-indigo-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-emerald-100 hover:border-emerald-300 transition-all transform hover:-translate-y-1 shadow-lg shadow-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 text-sm flex items-center">
                  <FaCheckCircle className="mr-1" /> Pagados
                </p>
                <p className={`text-3xl font-bold text-emerald-500 ${animateStats ? 'scale-110' : ''} transition-transform`}>
                  {stats.totalPagados}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-100 to-green-100 p-3 rounded-xl">
                <FaCrown className="text-2xl text-emerald-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-amber-100 hover:border-amber-300 transition-all transform hover:-translate-y-1 shadow-lg shadow-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-sm flex items-center">
                  <FaStar className="mr-1" /> Abonados
                </p>
                <p className={`text-3xl font-bold text-amber-500 ${animateStats ? 'scale-110' : ''} transition-transform`}>
                  {stats.totalAbonados}
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-3 rounded-xl">
                <FaRibbon className="text-2xl text-amber-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-rose-100 hover:border-rose-300 transition-all transform hover:-translate-y-1 shadow-lg shadow-rose-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-400 text-sm flex items-center">
                  <FaClock className="mr-1" /> Pendientes
                </p>
                <p className={`text-3xl font-bold text-rose-500 ${animateStats ? 'scale-110' : ''} transition-transform`}>
                  {stats.totalPendientes}
                </p>
              </div>
              <div className="bg-gradient-to-br from-rose-100 to-pink-100 p-3 rounded-xl">
                <FaRegHeart className="text-2xl text-rose-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-purple-100 hover:border-purple-300 transition-all transform hover:-translate-y-1 shadow-lg shadow-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm flex items-center">
                  <FaCoins className="mr-1" /> Ingresos
                </p>
                <p className={`text-3xl font-bold text-purple-500 ${animateStats ? 'scale-110' : ''} transition-transform`}>
                  ${stats.totalIngresos}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl">
                <FaChartLine className="text-2xl text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Formulario con animación y diseño elegante */}
        {showForm && (
          <div className="mb-8 bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-blue-100 shadow-2xl animate-fadeIn relative overflow-hidden">
            {/* Decoración */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-100/30 to-rose-100/30 rounded-full -ml-24 -mb-24"></div>
            
            <h2 className="text-2xl font-bold mb-6 flex items-center relative">
              {editingId ? (
                <>
                  <div className="bg-gradient-to-r from-amber-400 to-pink-400 p-2 rounded-xl mr-3">
                    <FaEdit className="text-white text-xl" />
                  </div>
                  <span className="bg-gradient-to-r from-amber-600 to-pink-600 bg-clip-text text-transparent">
                    ✨ Editando Pedido
                  </span>
                </>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-blue-400 to-indigo-400 p-2 rounded-xl mr-3">
                    <FaPlus className="text-white text-xl" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    ✨ Nuevo Pedido
                  </span>
                </>
              )}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Campos del formulario con diseño mejorado */}
                <div className="group">
                  <label className="block text-indigo-600 font-medium mb-2 flex items-center text-sm">
                    <FaUser className="mr-2 text-blue-400" /> Nombre del Cliente
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all pl-10"
                      placeholder="Ej: María Pérez"
                    />
                    <FaRegSmile className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-indigo-600 font-medium mb-2 flex items-center text-sm">
                    <FaPhone className="mr-2 text-blue-400" /> Teléfono
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      maxLength="10"
                      required
                      className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all pl-10"
                      placeholder="Ej: 4181234567"
                    />
                    <FaRegHeart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-indigo-600 font-medium mb-2 flex items-center text-sm">
                    <FaMapMarkerAlt className="mr-2 text-blue-400" /> Dirección
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all pl-10"
                      placeholder="Dirección completa"
                    />
                    <FaPalette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                  </div>
                </div>

                <div>
                  <label className="block text-indigo-600 font-medium mb-2 flex items-center text-sm">
                    <FaCalendarAlt className="mr-2 text-blue-400" /> Fecha Solicitud
                  </label>
                  <input
                    type="date"
                    name="fecha_solicitud"
                    value={form.fecha_solicitud}
                    onChange={handleChange}
                    className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-gray-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-indigo-600 font-medium mb-2 flex items-center text-sm">
                    <FaClock className="mr-2 text-blue-400" /> Fecha Envío
                  </label>
                  <input
                    type="date"
                    name="fecha_envio"
                    value={form.fecha_envio}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-gray-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-indigo-600 font-medium mb-2 flex items-center text-sm">
                    <FaMoneyBillWave className="mr-2 text-blue-400" /> Total ($)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="total"
                      value={form.total}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all pl-10"
                      placeholder="0.00"
                    />
                    <FaGem className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-300" />
                  </div>
                </div>

                <div>
                  <label className="block text-indigo-600 font-medium mb-2 flex items-center text-sm">
                    <FaMoneyBillWave className="mr-2 text-blue-400" /> Abono ($)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="abono"
                      value={form.abono}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all pl-10"
                      placeholder="0.00"
                    />
                    <FaFeather className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-indigo-600 font-medium mb-2 text-sm flex items-center">
                    <FaCreditCard className="mr-2 text-blue-400" /> Métodos de Pago
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: "Efectivo", icon: <FaMoneyBillWave /> },
                      { name: "Transferencia", icon: <FaWallet /> },
                      { name: "Tarjeta", icon: <FaCreditCard /> },
                      { name: "Depósito", icon: <FaCoins /> }
                    ].map(({ name, icon }) => (
                      <label
                        key={name}
                        className={`flex items-center justify-center space-x-2 p-3 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                          form.pagado.includes(name)
                            ? "bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-lg"
                            : "bg-white border border-blue-100 text-indigo-400 hover:bg-blue-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={name}
                          checked={form.pagado.includes(name)}
                          onChange={handlePagadoChange}
                          className="hidden"
                        />
                        <span className="text-lg">{icon}</span>
                        <span>{name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-indigo-600 font-medium mb-2 flex items-center text-sm">
                    <FaComment className="mr-2 text-blue-400" /> Comentario
                  </label>
                  <div className="relative">
                    <textarea
                      name="comentario"
                      value={form.comentario}
                      onChange={handleChange}
                      rows="3"
                      className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all pl-10"
                      placeholder="Comentarios adicionales..."
                    />
                    <FaPaintBrush className="absolute left-3 top-3 text-purple-300" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(false); }}
                  className="px-6 py-3 bg-white border border-blue-200 hover:bg-blue-50 text-indigo-400 rounded-xl font-semibold transition-all flex items-center space-x-2"
                >
                  <FaTimes />
                  <span>Cancelar</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-blue-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <FaMagic />
                      <span>{editingId ? "Actualizar" : "Guardar"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Barra de búsqueda y filtros con diseño femenino */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-300 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/90 border border-blue-100 rounded-xl text-gray-700 placeholder-indigo-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-300 hover:text-indigo-500 transition-colors"
              >
                <FaTimes />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-8 py-4 bg-white/90 border border-blue-100 rounded-xl text-gray-700 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
              >
                <option value="todos" className="bg-white">📋 Todos los pedidos</option>
                <option value="pagado" className="bg-white">✅ Pagados</option>
                <option value="abonado" className="bg-white">💰 Abonados</option>
                <option value="pendiente" className="bg-white">⏳ Pendientes</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("todos");
              }}
              className="px-4 py-4 bg-white/90 hover:bg-white border border-blue-100 rounded-xl text-indigo-400 hover:text-indigo-600 transition-all"
              title="Limpiar filtros"
            >
              <FaUndo />
            </button>
          </div>
        </div>

        {/* Lista de pedidos con diseño de tarjetas femenino */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-400"></div>
            <p className="text-indigo-400 mt-4 text-lg">Cargando pedidos...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center bg-white/80 p-4 rounded-xl border border-blue-100">
              <p className="text-indigo-400 flex items-center">
                <FaGem className="mr-2 text-amber-400" />
                Mostrando <span className="text-indigo-600 font-bold mx-1">{pedidosFiltrados.length}</span> de <span className="text-indigo-600 font-bold mx-1">{pedidos.length}</span> pedidos
              </p>
              <button
                onClick={() => cargarPedidos()}
                className="px-4 py-2 bg-white hover:bg-indigo-50 rounded-lg text-indigo-400 hover:text-indigo-600 transition-all text-sm flex items-center gap-2 border border-blue-100"
              >
                <FaUndo className="text-xs" />
                Actualizar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pedidosFiltrados.map((pedido, index) => (
                <div
                  key={pedido._id}
                  className="group bg-white/90 backdrop-blur-lg rounded-3xl p-6 border border-blue-100 hover:border-indigo-200 transition-all transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-100/50 relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Decoración de fondo */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start mb-4 relative">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors flex items-center">
                        <FaRegHeart className="mr-2 text-pink-400 text-sm" />
                        {pedido.nombre}
                      </h3>
                      <p className="text-indigo-400 flex items-center mt-1 text-sm">
                        <FaPhone className="mr-2 text-xs" /> {pedido.telefono}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center ${getStatusColor(pedido.pagado, pedido.total, pedido.abono)}`}>
                      {getStatusIcon(pedido.pagado, pedido.total, pedido.abono)}
                      {getStatusText(pedido.pagado, pedido.total, pedido.abono)}
                    </span>
                  </div>

                  <div className="space-y-3 text-gray-600 relative">
                    <p className="flex items-start text-sm">
                      <FaMapMarkerAlt className="mr-2 mt-1 flex-shrink-0 text-pink-400" />
                      <span className="line-clamp-2">{pedido.direccion}</span>
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3">
                      <div>
                        <p className="text-indigo-400 text-xs flex items-center">
                          <FaGem className="mr-1 text-amber-400" /> Total
                        </p>
                        <p className="font-bold text-indigo-600">${pedido.total}</p>
                      </div>
                      <div>
                        <p className="text-indigo-400 text-xs flex items-center">
                          <FaFeather className="mr-1 text-blue-400" /> Abono
                        </p>
                        <p className="font-bold text-indigo-600">${pedido.abono}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white rounded-xl p-3 border border-blue-100">
                      <span className="text-sm text-indigo-400 flex items-center">
                        <FaStar className="mr-1 text-amber-400" /> Saldo:
                      </span>
                      <span className={`font-bold text-lg ${
                        calcularSaldo(pedido.total, pedido.abono) > 0 
                          ? "text-amber-500" 
                          : "text-emerald-500"
                      }`}>
                        ${calcularSaldo(pedido.total, pedido.abono)}
                      </span>
                    </div>

                    {Array.isArray(pedido.pagado) && pedido.pagado.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pedido.pagado.map((metodo, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-xs text-indigo-600 border border-blue-100 flex items-center"
                          >
                            {metodo === "Efectivo" && <FaMoneyBillWave className="mr-1 text-xs" />}
                            {metodo === "Transferencia" && <FaWallet className="mr-1 text-xs" />}
                            {metodo === "Tarjeta" && <FaCreditCard className="mr-1 text-xs" />}
                            {metodo === "Depósito" && <FaCoins className="mr-1 text-xs" />}
                            {metodo}
                          </span>
                        ))}
                      </div>
                    )}

                    {pedido.comentario && (
                      <p className="text-sm mt-2 italic text-gray-500 line-clamp-2 border-t border-blue-100 pt-2 flex items-start">
                        <FaComment className="mr-2 text-pink-400 text-xs mt-1" />
                        {pedido.comentario}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-blue-100 flex justify-end space-x-2 relative">
                    <button
                      onClick={() => handleEdit(pedido)}
                      className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Editar pedido"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(pedido._id)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Eliminar pedido"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}

              {pedidosFiltrados.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-12 inline-block border border-blue-100 shadow-xl">
                    <FaRegHeart className="text-6xl text-pink-300 mx-auto mb-4" />
                    <p className="text-indigo-400 text-lg mb-4">No hay pedidos que mostrar</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all inline-flex items-center gap-2 shadow-lg shadow-blue-200"
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