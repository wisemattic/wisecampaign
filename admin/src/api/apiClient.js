import axios from 'axios';

// Create an Axios instance for API requests
const apiClient = axios.create({
    baseURL: '/wp-json/wise-campaign-plugin/v1', // Base URL for the API
    headers: {
        'Content-Type': 'application/json', // Default content type for requests
    },
});

// Optional: Add request interceptors for authentication or logging
apiClient.interceptors.request.use(
    (config) => {
        // You can modify the request config here, e.g., add authentication tokens
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers['Authorization'] = `Bearer ${token}`;
        // }
        // Dynamically set the Content-Type for FormData
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data'; // Default for JSON
        } else {
            config.headers['Content-Type'] = 'application/json'; // Default for JSON
        }

        return config;
    },
    (error) => {
        // Handle request error
        return Promise.reject(error);
    }
);

// Optional: Add response interceptors for global error handling or logging
apiClient.interceptors.response.use(
    (response) => {
        return response; // Return response as is
    },
    (error) => {
        // Handle response errors globally
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default apiClient;
