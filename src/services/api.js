import axios from 'axios';

// Obtenemos la URL base del backend desde las variables de entorno
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Creamos una instancia de axios con la URL base
const api = axios.create({
  baseURL: API_URL,  // Usamos la URL del backend desde las variables de entorno
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
