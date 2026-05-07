export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
export const IMAGE_BASE_URL = BASE_URL.replace('/api', '');

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
    },

    // Orders
    async createOrder(orderData) {
        const res = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return handleResponse(res);
    },

    async getOrders() {
        const res = await fetch(`${BASE_URL}/orders`);
        return handleResponse(res);
    },

    async getOrder(id) {
        const res = await fetch(`${BASE_URL}/orders/${id}`);
        return handleResponse(res);
    },

    async updateOrderStatus(id, status) {
        const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return handleResponse(res);
    },

    async uploadPaymentProof(id, file) {
        const formData = new FormData();
        formData.append('paymentProof', file);
        const res = await fetch(`${BASE_URL}/orders/${id}/payment`, {
            method: 'POST',
            body: formData
        });
        return handleResponse(res);
    },

    async updatePaymentStatus(id, payment_status) {
        const res = await fetch(`${BASE_URL}/orders/${id}/payment-status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_status })
        });
        return handleResponse(res);
    },

    // Notifications
    async getNotifications(userId) {
        const res = await fetch(`${BASE_URL}/notifications/${userId}`);
        return handleResponse(res);
    },

    async markAsRead(id) {
        const res = await fetch(`${BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
        return handleResponse(res);
    },

    async markAllAsRead(userId) {
        const res = await fetch(`${BASE_URL}/notifications/read-all/${userId}`, { method: 'PUT' });
        return handleResponse(res);
    },

    // Tracking
    async addTrackingLog(id, logData) {
        const res = await fetch(`${BASE_URL}/orders/${id}/tracking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        });
        return handleResponse(res);
    },

    async updateTrackingInfo(id, trackingData) {
        const res = await fetch(`${BASE_URL}/orders/${id}/tracking-info`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackingData)
        });
        return handleResponse(res);
    }
};
