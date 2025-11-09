import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Create a public, unauthenticated instance (for login/register)
export const publicApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create a protected, authenticated instance
export const protectedApi = (token) => {
    const api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : null
        },
    });

    return api;
};