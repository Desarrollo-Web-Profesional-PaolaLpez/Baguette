import axios from "axios";

// 🔴 DIAGNÓSTICO: Usamos URL fija para probar
const API = axios.create({
  baseURL: 'https://baguette-production-6565.up.railway.app/api/v1', 
  timeout: 10000,
});

// Verificar qué URL se está usando
console.log('🚨 URL FIJA configurada:', API.defaults.baseURL);

// Interceptor para ver cada petición
API.interceptors.request.use(request => {
  console.log('📤 Petición:', request.method.toUpperCase(), request.url);
  console.log('   URL completa:', API.defaults.baseURL + request.url);
  return request;
});

// Interceptor para respuestas (igual)
API.interceptors.response.use(
  response => {
    console.log('✅ Respuesta exitosa:', response.status);
    return response;
  },
  error => {
    console.error('❌ Error en petición:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default API;