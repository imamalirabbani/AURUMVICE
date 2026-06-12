export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
export const IMAGE_BASE_URL = BASE_URL.replace('/api', '');

// Helper untuk mendapatkan token dari localStorage
const getToken = () => {
    const token = localStorage.getItem('token');
    return token;
};

// Helper untuk membuat headers dengan auth token
const authHeaders = (extraHeaders = {}) => {
    const headers = { ...extraHeaders };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const jsonAuthHeaders = () => authHeaders({ 'Content-Type': 'application/json' });

export const getImgUrl = (url, placeholder = '800x1000?text=AURUMVICE') => {
    if (!url) return `https://via.placeholder.com/${placeholder}`;
    
    // Trim and fix common protocol issues (like missing colon or multiple slashes)
    let cleanUrl = url.trim();
    
    // Nuclear fix for protocol issues (missing colon, extra slashes)
    // This turns "https//something" or "https:///something" into "https://something"
    if (cleanUrl.toLowerCase().startsWith('http')) {
        cleanUrl = cleanUrl.replace(/^(https?):?\/*\/*/i, '$1://');
    }

    if (cleanUrl.startsWith('http')) return cleanUrl;
    
    // Ensure relative paths start with /
    const separator = cleanUrl.startsWith('/') ? '' : '/';
    return `${IMAGE_BASE_URL}${separator}${cleanUrl}`;
};

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        // Jika token expired/invalid, logout otomatis
        if (response.status === 401 || response.status === 403) {
            // Jangan auto-logout untuk login/register endpoints
            const url = response.url || '';
            if (!url.includes('/login') && !url.includes('/register')) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.dispatchEvent(new Event('auth-logout'));
            }
        }
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

    // Cart (perlu auth)
    async getCart() {
        const token = getToken();
        if (!token) return []; // Tidak login = cart kosong
        const res = await fetch(`${BASE_URL}/cart`, {
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    async addToCart(product_id, quantity = 1) {
        const res = await fetch(`${BASE_URL}/cart`, {
            method: 'POST',
            headers: jsonAuthHeaders(),
            body: JSON.stringify({ product_id, quantity })
        });
        return handleResponse(res);
    },

    async removeFromCart(id) {
        const res = await fetch(`${BASE_URL}/cart/${id}`, { 
            method: 'DELETE',
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    async clearCart() {
        const res = await fetch(`${BASE_URL}/cart`, { 
            method: 'DELETE',
            headers: authHeaders()
        });
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
    async getUsers() {
        const res = await fetch(`${BASE_URL}/users`, {
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    async getUser(id) {
        const res = await fetch(`${BASE_URL}/users/${id}`, {
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    async updateUser(id, data) {
        const res = await fetch(`${BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: jsonAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    // About
    async getAbout() {
        const res = await fetch(`${BASE_URL}/about`);
        return handleResponse(res);
    },

    async updateAbout(data) {
        const res = await fetch(`${BASE_URL}/about`, {
            method: 'PUT',
            headers: jsonAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    // Orders
    async createOrder(orderData) {
        const res = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: jsonAuthHeaders(),
            body: JSON.stringify(orderData)
        });
        return handleResponse(res);
    },

    async getOrders() {
        const res = await fetch(`${BASE_URL}/orders`, {
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    async getOrder(id) {
        const res = await fetch(`${BASE_URL}/orders/${id}`, {
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    async getUserOrders(userId) {
        const res = await fetch(`${BASE_URL}/orders/user/${userId}`, {
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    async updateOrderStatus(id, status) {
        const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: jsonAuthHeaders(),
            body: JSON.stringify({ status })
        });
        return handleResponse(res);
    },

    async cancelOrder(id) {
        const res = await fetch(`${BASE_URL}/orders/${id}/cancel`, {
            method: 'PUT',
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    async uploadPaymentProof(id, file) {
        const formData = new FormData();
        formData.append('paymentProof', file);
        const res = await fetch(`${BASE_URL}/orders/${id}/payment`, {
            method: 'POST',
            headers: authHeaders(), // Jangan set Content-Type, biarkan browser auto-set untuk FormData
            body: formData
        });
        return handleResponse(res);
    },

    async updatePaymentStatus(id, payment_status) {
        const res = await fetch(`${BASE_URL}/orders/${id}/payment-status`, {
            method: 'PUT',
            headers: jsonAuthHeaders(),
            body: JSON.stringify({ payment_status })
        });
        return handleResponse(res);
    },

    async deleteOrder(id) {
        const res = await fetch(`${BASE_URL}/orders/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    // Notifications
    async getNotifications(userId) {
        const res = await fetch(`${BASE_URL}/notifications/${userId}`, {
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    async markAsRead(id) {
        const res = await fetch(`${BASE_URL}/notifications/${id}/read`, { 
            method: 'PUT',
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    async markAllAsRead(userId) {
        const res = await fetch(`${BASE_URL}/notifications/read-all/${userId}`, { 
            method: 'PUT',
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    // Tracking
    async addTrackingLog(id, logData) {
        const res = await fetch(`${BASE_URL}/orders/${id}/tracking`, {
            method: 'POST',
            headers: jsonAuthHeaders(),
            body: JSON.stringify(logData)
        });
        return handleResponse(res);
    },

    async updateTrackingInfo(id, trackingData) {
        const res = await fetch(`${BASE_URL}/orders/${id}/tracking-info`, {
            method: 'PUT',
            headers: jsonAuthHeaders(),
            body: JSON.stringify(trackingData)
        });
        return handleResponse(res);
    },

    // Admin Products (perlu auth)
    async createProduct(formData) {
        const res = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: authHeaders(),
            body: formData
        });
        return handleResponse(res);
    },

    async updateProduct(id, formData) {
        const res = await fetch(`${BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: formData
        });
        return handleResponse(res);
    },

    async deleteProduct(id) {
        const res = await fetch(`${BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    // Reviews
    async getReviews(id) {
        const res = await fetch(`${BASE_URL}/products/${id}/reviews`);
        return handleResponse(res);
    },

    async createReview(reviewData) {
        const res = await fetch(`${BASE_URL}/reviews`, {
            method: 'POST',
            headers: jsonAuthHeaders(),
            body: JSON.stringify(reviewData)
        });
        return handleResponse(res);
    },

    // Wishlist
    async getWishlist() {
        const res = await fetch(`${BASE_URL}/wishlist`, {
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    async addToWishlist(product_id) {
        const res = await fetch(`${BASE_URL}/wishlist`, {
            method: 'POST',
            headers: jsonAuthHeaders(),
            body: JSON.stringify({ product_id })
        });
        return handleResponse(res);
    },

    async removeFromWishlist(productId) {
        const res = await fetch(`${BASE_URL}/wishlist/${productId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        return handleResponse(res);
    },

    // Admin
    async getAdminStats() {
        const res = await fetch(`${BASE_URL}/admin/stats`, {
            headers: authHeaders()
        });
        return handleResponse(res);
    }
};
