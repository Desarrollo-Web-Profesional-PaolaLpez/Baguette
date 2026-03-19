import axios from "axios";

// Verificar que la variable de entorno existe
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);

if (!import.meta.env.VITE_API_URL) {
  console.error('❌ VITE_API_URL no está definida en las variables de entorno');
}

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para ver cada petición
API.interceptors.request.use(request => {
  console.log('📤 Petición:', request.method.toUpperCase(), request.url);
  console.log('   URL completa:', request.baseURL + request.url);
  return request;
});

// Interceptor para respuestas
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
    } else if (error.request) {
      console.error('   No se recibió respuesta');
    } else {
      console.error('   Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;