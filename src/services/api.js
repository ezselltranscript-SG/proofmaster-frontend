import axios from 'axios';

// Creamos una instancia de axios con la URL base
// Usamos el proxy configurado en setupProxy.js para evitar problemas de CORS
const api = axios.create({
  baseURL: '/api',  // Esto usará el proxy configurado en setupProxy.js
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Servicio para el corrector ortográfico
export const spellcheckService = {
  // Enviar texto para revisar
  checkText: async (text) => {
    try {
      const response = await api.post('/spellcheck', { text });
      return response.data;
    } catch (error) {
      console.error('Error en la revisión ortográfica:', error);
      throw error;
    }
  },
};

export default api;
