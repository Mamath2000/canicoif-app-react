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

export default instance;
