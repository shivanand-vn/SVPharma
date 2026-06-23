import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (
        typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:5000/api'
            : 'https://svpharma.onrender.com/api'
    ),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
