import axios from "axios";

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'X-API-KEY': import.meta.env.VITE_API_KEY,
  },
});


export default api;
