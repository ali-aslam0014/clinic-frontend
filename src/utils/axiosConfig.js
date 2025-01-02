import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://myclinic-api.vercel.app'
  : 'http://localhost:8080';

console.log('Current Environment:', process.env.NODE_ENV);
console.log('Using API URL:', API_URL);

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: false,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    config => {
        // Remove timestamp for now
        console.log('Making request to:', config.baseURL + config.url);
        console.log('Request data:', config.data);
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    response => {
        console.log('Response received:', response.data);
        return response;
    },
    error => {
        console.error('Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });
        return Promise.reject(error);
    }
);

export default axiosInstance;