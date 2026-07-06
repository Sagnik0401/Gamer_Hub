import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
