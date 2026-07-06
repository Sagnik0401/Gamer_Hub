import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',        // Vite dev proxy forwards this to http://localhost:5000/api
  withCredentials: true   // required to send httpOnly cookie
});

axiosInstance.interceptors.response.use(
  res => res,
  err => {
    const isAuthPage = ['/login', '/register'].includes(window.location.pathname);
    if (err.response?.status === 401 && !isAuthPage) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
