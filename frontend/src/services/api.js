import axios from 'axios';
import toast from 'react-hot-toast';

// Task 4: Verify URL logic
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

console.log(`[SYS] API Base URL initialized to: ${API_BASE_URL}`);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // Increased timeout for connectivity issues
});

// Task 8: Prevent toast spam
let lastToastTime = 0;
const TOAST_THRESHOLD = 5000;

const showUniqueToast = (msg) => {
    const now = Date.now();
    if (now - lastToastTime > TOAST_THRESHOLD) {
        toast.error(msg);
        lastToastTime = now;
    }
};

// Task 5: Detailed Logging Interceptors
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`%c[API REQUEST] ${config.method.toUpperCase()} ${config.url}`, 'color: #0ea5e9; font-weight: bold;', {
        baseURL: config.baseURL,
        fullURL: config.baseURL + config.url,
        payload: config.data || 'None'
    });
    
    return config;
}, (error) => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
});

api.interceptors.response.use((response) => {
    console.log(`%c[API RESPONSE] ${response.status} ${response.config.url}`, 'color: #10b981; font-weight: bold;', response.data);
    return response;
}, (error) => {
    const errorInfo = {
        message: error.message,
        code: error.code,
        status: error.response?.status || 'NETWORK_FAIL',
        url: error.config?.url,
        data: error.response?.data
    };

    console.error('%c[API ERROR]', 'color: #f43f5e; font-weight: bold;', errorInfo);
    
    if (errorInfo.status === 422) {
        console.warn('%c[VALIDATION ERROR DETAILED]', 'color: #fbbf24; font-weight: bold;', JSON.stringify(error.response.data, null, 2));
    }

    if (errorInfo.status === 401) {
        if (!window.location.pathname.includes('/login')) {
            showUniqueToast("Session expired. Please log in.");
            localStorage.clear();
            window.location.href = '/login';
        }
    } else if (errorInfo.code === 'ERR_NETWORK') {
        showUniqueToast(`Network Error: Backend unreachable.`);
    } else {
        const detail = error.response?.data?.detail || error.message;
        showUniqueToast(`API Error: ${detail}`);
    }
    
    return Promise.reject(error);
});

export const authService = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    checkHealth: () => api.get('/health'),
};

export const hospitalService = {
    getNearby: (lat, lng, radius = 50) => api.get(`/hospitals/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
    getAll: () => api.get('/hospitals'),
    getProfile: () => api.get('/hospitals/profile'),
    updateResources: (data) => api.put('/hospitals/resources', data),
};

export const overpassService = {
    fetchNearby: async (lat, lng, radius) => {
        return {
            elements: []
        };
    }
};
export const emergencyService = {
    createRequest: (data) => api.post('/emergency/request', data),
    getQueue: () => api.get('/emergency/queue'),
    updateStatus: (id, status) => api.put(`/emergency/request/${id}/status`, { status }),
    track: (id) => api.get(`/emergency/track/${id}`),
};

export const patientService = {
    getHealthProfile: () => api.get('/patient/health-profile'),
    updateHealthProfile: (data) => api.put('/patient/health-profile', data),
    uploadReport: (formData) => api.post('/patient/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getReports: () => api.get('/patient/reports'),
};

export const adminService = {
    getAnalytics: () => api.get('/admin/analytics'),
};

export const chatbotService = {
    sendMessage: (message, context, nearby_hospitals = null, location = null) => 
        api.post('/chatbot/message', { message, context, nearby_hospitals, location }),
};

export default api;
