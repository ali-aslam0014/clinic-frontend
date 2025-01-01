import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://myclinic-api.vercel.app'
  : 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add CORS headers for production
        'Access-Control-Allow-Origin': 'https://myclinic-app.vercel.app',
        'Access-Control-Allow-Credentials': true
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    config => {
        // Add timestamp to prevent caching
        config.params = {
            ...config.params,
            _t: Date.now()
        };
        console.log('Making request to:', config.baseURL + config.url);
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
        if (error.code === 'ERR_NETWORK') {
            console.error('Network Error Details:', {
                url: error.config?.url,
                method: error.config?.method,
                baseURL: error.config?.baseURL
            });
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;