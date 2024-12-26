import axios from 'axios';

const API_URL = 'https://myclinic-api.vercel.app';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 10000,  // 10 second timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    config => {
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