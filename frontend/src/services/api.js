const BASE_URL = 'http://localhost:3002/api';

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }
    return data;
};

export const api = {
    // Products
    async getProducts(search = '', category = '') {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (category) query.append('category', category);
        const res = await fetch(`${BASE_URL}/products?${query.toString()}`);
        return handleResponse(res);
    },

    async getProduct(id) {
        const res = await fetch(`${BASE_URL}/products/${id}`);
        return handleResponse(res);
    },

    // Cart
    async getCart() {
        const res = await fetch(`${BASE_URL}/cart`);
        return handleResponse(res);
    },

    async addToCart(product_id, quantity = 1) {
        const res = await fetch(`${BASE_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id, quantity })
        });
        return handleResponse(res);
    },

    async removeFromCart(id) {
        const res = await fetch(`${BASE_URL}/cart/${id}`, { method: 'DELETE' });
        return handleResponse(res);
    },

    async clearCart() {
        const res = await fetch(`${BASE_URL}/cart`, { method: 'DELETE' });
        return handleResponse(res);
    },

    // Auth
    async login(email, password) {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return handleResponse(res);
    },

    async register(username, email, password) {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        return handleResponse(res);
    },

    // User
    async getUser(id) {
        const res = await fetch(`${BASE_URL}/users/${id}`);
        return handleResponse(res);
    },

    async updateUser(id, data) {
        const res = await fetch(`${BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    // About
    async getAbout() {
        const res = await fetch(`${BASE_URL}/about`);
        return handleResponse(res);
    }
};
