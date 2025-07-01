import axios from "axios";

// Intercepteur pour ajouter le token JWT à chaque requête API
const instance = axios.create();

instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.url.startsWith('/api/')) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs liées au token JWT
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Redirige vers la boîte de dialogue de connexion
      localStorage.removeItem('jwt_token');
      window.dispatchEvent(new Event('logout')); // Événement personnalisé pour déclencher la déconnexion
    }
    return Promise.reject(error);
  }
);

export default instance;
