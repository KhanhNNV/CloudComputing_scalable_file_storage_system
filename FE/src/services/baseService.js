import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// ĐÃ MỞ KHÓA INTERCEPTOR ĐỂ GẮN TOKEN
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    // Nếu có token, kẹp nó vào Header Authorization
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;