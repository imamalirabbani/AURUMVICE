const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { getPool, initDatabase } = require('./config/db');
const { supabase } = require('./config/supabase');


const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'aurumvice_fallback_secret';
const ADMIN_EMAIL = 'admin@aurumvice.com';

// Middleware - CORS dengan origin spesifik
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, true); // Tetap izinkan untuk fleksibilitas dev, tapi log
    },
    credentials: true
}));
app.use(express.json());

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, email, role }
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
};

// Middleware khusus admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang diizinkan.' });
    }
    next();
};

// Initialize DB for Serverless Environment (Vercel)
let isDbInitialized = false;
let isDbInitializing = false;

// Quick check function to see if DB is already set up
async function checkIsSetup() {
    try {
        const pool = await getPool();
        // Just check if users table exists
        await pool.query("SELECT 1 FROM users LIMIT 1");
        return true;
    } catch (err) {
        // If table doesn't exist, PG returns code 42P01
        return false;
    }
}

app.use(async (req, res, next) => {
    // If we already know it's initialized in this instance, proceed
    if (isDbInitialized) return next();
    
    // Prevent multiple concurrent init attempts
    if (isDbInitializing) {
        return res.status(503).json({ error: "Database is initializing. Please refresh in a few seconds." });
    }

    isDbInitializing = true;
    try {
        // Step 1: Quick check if already setup
        const alreadySetup = await checkIsSetup();
        
        if (!alreadySetup) {
            console.log("Database tables missing. Starting full initialization...");
            await initDatabase();
            console.log("Database initialized successfully");
        } else {
            console.log("Database already setup. Skipping initialization.");
        }
        
        isDbInitialized = true;
        isDbInitializing = false;
        next();
    } catch (err) {
        isDbInitializing = false;
        console.error("Critical DB Error:", err);
        res.status(500).json({ 
            error: "Database Connection or Initialization Failed",
            message: err.message,
            code: err.code,
            hint: "Check if Supabase credentials are correct and database is not paused."
        });
    }
});

// Setup uploads folder (local dev only)
const uploadDir = path.join(__dirname, 'uploads');
if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer: use memory storage so it works on Vercel (serverless)
const upload = multer({ storage: multer.memoryStorage() });

// Wrapper for async routes to catch errors
const catchAsync = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};

// Helper to create notifications
const createNotification = async (userId, message, type = 'info') => {
    try {
        const pool = await getPool();
        await pool.query(
            "INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)",
            [userId, message, type]
        );
        console.log(`Notification created for User ${userId}: ${message}`);
    } catch (err) {
        console.error("Failed to create notification:", err);
    }
};

// Test DB Connection
app.get('/api/health', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'success',
            message: 'Database connected successfully',
            time: result.rows[0].now,
            config: {
                host: process.env.DB_HOST,
                port: process.env.DB_HOST?.includes('pooler') ? 6543 : 5432,
                database: process.env.DB_NAME,
                user: process.env.DB_USER
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message,
            code: err.code,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// --- Routes ---

// Get all products (Optimized)
app.get('/api/products', catchAsync(async (req, res) => {
    const pool = await getPool();
    const { search, category } = req.query;
    const params = [];
    const conditions = [];

    if (search) {
        params.push(`%${search}%`);
        conditions.push(`name ILIKE $${params.length}`);
    }
    if (category) {
        params.push(category);
        conditions.push(`category = $${params.length}`);
    }

    let query = `
        SELECT p.*, 
        COALESCE(
            (SELECT json_agg(image_url) 
             FROM product_images 
             WHERE product_id = p.id), 
            '[]'::json
        ) as images
        FROM products p
    `;

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY p.id DESC";

    const { rows } = await pool.query(query, params);
    res.json(rows);
}));

// Get single product
app.get('/api/products/:id', catchAsync(async (req, res) => {
    const pool = await getPool();
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ error: "Product not found" });
    
    const { rows: images } = await pool.query("SELECT image_url FROM product_images WHERE product_id = $1", [req.params.id]);
    res.json({ ...rows[0], images: images.map(img => img.image_url) });
}));

// Create product
app.post('/api/products', authenticateToken, requireAdmin, upload.array('imageFiles', 5), catchAsync(async (req, res) => {
    const pool = await getPool();
    const { name, description, price, category } = req.body;
    let mainImage = '';
    const imageUrls = [];

    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const fileExt = path.extname(file.originalname);
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
            const filePath = `products/${fileName}`;

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                });

            if (error) {
                console.error('Supabase upload error:', error);
                throw new Error(`Upload failed: ${error.message}`);
            }

            const { data: publicUrlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);
            
            imageUrls.push(publicUrlData.publicUrl);
        }
        mainImage = imageUrls[0];
    }

    const { rows } = await pool.query(
        "INSERT INTO products (name, description, price, category, image) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [name, description, price, category, mainImage]
    );
    
    const productId = rows[0].id;

    for (const url of imageUrls) {
        await pool.query("INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)", [productId, url]);
    }
    
    res.status(201).json({ id: productId, name, mainImage });
}));


// Delete product
app.delete('/api/products/:id', authenticateToken, requireAdmin, catchAsync(async (req, res) => {
    const pool = await getPool();
    await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.json({ message: "Product deleted successfully" });
}));

// Update product
app.put('/api/products/:id', authenticateToken, requireAdmin, upload.array('imageFiles', 5), catchAsync(async (req, res) => {
    const pool = await getPool();
    const productId = parseInt(req.params.id);
    const { name, description, price, category } = req.body;
    
    console.log(`Updating product ${productId}...`);

    const result = await pool.query(
        "UPDATE products SET name = $1, description = $2, price = $3, category = $4 WHERE id = $5",
        [name, description, price, category, productId]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ error: "Product not found to update" });
    }

    if (req.files && req.files.length > 0) {
        const imageUrls = [];
        for (const file of req.files) {
            const fileExt = path.extname(file.originalname);
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
            const filePath = `products/${fileName}`;

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                });

            if (error) {
                console.error('Supabase upload error:', error);
                throw new Error(`Upload failed: ${error.message}`);
            }

            const { data: publicUrlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);
            
            imageUrls.push(publicUrlData.publicUrl);
        }

        const mainImage = imageUrls[0];
        await pool.query("UPDATE products SET image = $1 WHERE id = $2", [mainImage, productId]);
        await pool.query("DELETE FROM product_images WHERE product_id = $1", [productId]);
        
        for (const url of imageUrls) {
            await pool.query("INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)", [productId, url]);
        }
    }

    res.json({ message: "Product updated successfully with cloud storage" });
}));

// --- Cart Routes ---
app.get('/api/cart', authenticateToken, catchAsync(async (req, res) => {
    const pool = await getPool();
    const query = `
        SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image 
        FROM cart c 
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = $1
    `;
    const { rows } = await pool.query(query, [req.user.id]);
    res.json(rows);
}));

app.post('/api/cart', authenticateToken, catchAsync(async (req, res) => {
    const pool = await getPool();
    const { product_id, quantity } = req.body;
    const userId = req.user.id;
    const { rows } = await pool.query("SELECT * FROM cart WHERE product_id = $1 AND user_id = $2", [product_id, userId]);
    
    if (rows.length > 0) {
        await pool.query("UPDATE cart SET quantity = quantity + $1 WHERE id = $2", [quantity, rows[0].id]);
        res.json({ message: "Cart updated" });
    } else {
        const { rows: result } = await pool.query("INSERT INTO cart (product_id, quantity, user_id) VALUES ($1, $2, $3) RETURNING id", [product_id, quantity, userId]);
        res.status(201).json({ id: result[0].id });
    }
}));

app.delete('/api/cart/:id', authenticateToken, catchAsync(async (req, res) => {
    const pool = await getPool();
    await pool.query("DELETE FROM cart WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    res.json({ message: "Item removed from cart" });
}));

app.delete('/api/cart', authenticateToken, catchAsync(async (req, res) => {
    const pool = await getPool();
    await pool.query("DELETE FROM cart WHERE user_id = $1", [req.user.id]);
    res.json({ message: "Cart cleared" });
}));

// --- Auth Routes ---
app.post('/api/register', catchAsync(async (req, res) => {
    const pool = await getPool();
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "Missing fields" });

    if (password.length < 6) {
        return res.status(400).json({ error: "Password minimal 6 karakter" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { rows } = await pool.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id", [username, email, hashedPassword]);
    res.status(201).json({ id: rows[0].id, username, email });
}));

app.post('/api/login', catchAsync(async (req, res) => {
    const pool = await getPool();
    const { email, password } = req.body;
    
    // Ambil user beserta password hash
    const { rows } = await pool.query("SELECT id, username, email, password, address FROM users WHERE email = $1", [email]);
    
    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    
    // Bandingkan password dengan hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
    
    // Tentukan role
    const role = user.email === ADMIN_EMAIL ? 'admin' : 'user';
    
    // Generate JWT token
    const token = jwt.sign(
        { id: user.id, email: user.email, role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    // Jangan kirim password ke client
    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: "Login successful", user: { ...userWithoutPassword, role }, token });
}));

// --- Profile Routes ---
app.get('/api/users', authenticateToken, requireAdmin, catchAsync(async (req, res) => {
    const pool = await getPool();
    const { rows } = await pool.query("SELECT id, username, email, address, created_at FROM users ORDER BY created_at DESC");
    res.json(rows);
}));

app.get('/api/users/:id', authenticateToken, catchAsync(async (req, res) => {
    const pool = await getPool();
    const { rows } = await pool.query("SELECT id, username, email, address FROM users WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
}));

app.put('/api/users/:id', authenticateToken, catchAsync(async (req, res) => {
    const pool = await getPool();
    // User hanya bisa update profil sendiri (kecuali admin)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
        return res.status(403).json({ error: "Tidak diizinkan mengubah profil orang lain" });
    }
    const { username, email, address } = req.body;
    await pool.query("UPDATE users SET username = $1, email = $2, address = $3 WHERE id = $4", [username, email, address, req.params.id]);
    res.json({ message: "Profile updated" });
}));

// --- About Content ---
app.get('/api/about', catchAsync(async (req, res) => {
    const pool = await getPool();
    const { rows } = await pool.query("SELECT * FROM about_content");
    const contentMap = {};
    rows.forEach(row => contentMap[row.section_key] = { title: row.title, description: row.description });
    res.json(contentMap);
}));

app.put('/api/about', authenticateToken, requireAdmin, catchAsync(async (req, res) => {
    const pool = await getPool();
    for (const [key, data] of Object.entries(req.body)) {
        await pool.query("UPDATE about_content SET title = $1, description = $2 WHERE section_key = $3", [data.title, data.description, key]);
    }
    res.json({ message: "About content updated" });
}));


// --- Order Routes ---

// Create Order (Checkout)
app.post('/api/orders', authenticateToken, catchAsync(async (req, res) => {
    const pool = await getPool();
    const { 
        user_id, 
        client_name, 
        shipping_address, 
        pic_name, 
        phone_number, 
        notes, 
        payment_method, 
        items,
        total_amount 
    } = req.body;

    // 1. Create the order
    const { rows: orderRows } = await pool.query(
        `INSERT INTO orders 
        (user_id, client_name, shipping_address, pic_name, phone_number, notes, payment_method, total_amount) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING id`,
        [user_id, client_name, shipping_address, pic_name, phone_number, notes, payment_method, total_amount]
    );

    const orderId = orderRows[0].id;

    // 2. Add items
    for (const item of items) {
        await pool.query(
            "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)",
            [orderId, item.product_id, item.quantity, item.price]
        );
    }

    // 3. Clear cart for this user
    await pool.query("DELETE FROM cart WHERE user_id = $1", [req.user.id]);

    // 4. Create notification for admin (using user_id null or 1 as admin for now)
    await createNotification(1, `Pesanan baru #${orderId} dari ${client_name}`, 'order');

    res.status(201).json({ id: orderId, message: "Order placed successfully" });
}));

// Get all orders (Admin Optimized)
app.get('/api/orders', authenticateToken, requireAdmin, catchAsync(async (req, res) => {
    const pool = await getPool();
    const query = `
        SELECT o.*, 
        COALESCE(
            (SELECT json_agg(item_data)
             FROM (
                 SELECT oi.*, p.name, p.image 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 WHERE oi.order_id = o.id
             ) item_data), 
            '[]'::json
        ) as items
        FROM orders o 
        ORDER BY o.created_at DESC
    `;
    
    const { rows: orders } = await pool.query(query);
    res.json(orders);
}));

// Get single order details
app.get('/api/orders/:id', authenticateToken, catchAsync(async (req, res) => {
    const pool = await getPool();
    const { rows: orders } = await pool.query("SELECT * FROM orders WHERE id = $1", [req.params.id]);
    
    if (orders.length === 0) return res.status(404).json({ error: "Order not found" });
    
    const { rows: items } = await pool.query(`
        SELECT oi.*, p.name, p.image 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = $1
    `, [req.params.id]);

    const { rows: trackingLogs } = await pool.query("SELECT * FROM tracking_logs WHERE order_id = $1 ORDER BY created_at DESC", [req.params.id]);

    res.json({ ...orders[0], items, tracking_logs: trackingLogs });
}));

// Get all orders for a specific user (Optimized)
app.get('/api/orders/user/:userId', authenticateToken, catchAsync(async (req, res) => {
    const pool = await getPool();
    const query = `
        SELECT o.*, 
        COALESCE(
            (SELECT json_agg(item_data)
             FROM (
                 SELECT oi.*, p.name, p.image 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 WHERE oi.order_id = o.id
             ) item_data), 
            '[]'::json
        ) as items
        FROM orders o 
        WHERE o.user_id = $1
        ORDER BY o.created_at DESC
    `;
    
    const { rows: orders } = await pool.query(query, [req.params.userId]);
    res.json(orders);
}));

// Update order status (Admin)
app.put('/api/orders/:id/status', authenticateToken, requireAdmin, catchAsync(async (req, res) => {
    const pool = await getPool();
    const { status } = req.body;
    const { rows: orders } = await pool.query("UPDATE orders SET status = $1 WHERE id = $2 RETURNING user_id", [status, req.params.id]);
    
    if (orders.length > 0 && orders[0].user_id) {
        await createNotification(orders[0].user_id, `Status pesanan #${req.params.id} Anda diperbarui menjadi: ${status}`, 'order_status');
    }

    res.json({ message: "Order status updated" });
}));

// Cancel Order (Client)
app.put('/api/orders/:id/cancel', authenticateToken, catchAsync(async (req, res) => {
    const pool = await getPool();
    const orderId = req.params.id;
    
    // Check if order exists and is still pending
    const { rows } = await pool.query("SELECT status, user_id FROM orders WHERE id = $1", [orderId]);
    if (rows.length === 0) return res.status(404).json({ error: "Order not found" });
    
    if (rows[0].status !== 'Pending') {
        return res.status(400).json({ error: "Hanya pesanan berstatus 'Pending' yang bisa dibatalkan." });
    }

    await pool.query("UPDATE orders SET status = 'Cancel' WHERE id = $1", [orderId]);
    
    // Notify admin about cancellation
    await createNotification(1, `Pesanan #${orderId} telah dibatalkan oleh pelanggan.`, 'alert');

    res.json({ message: "Pesanan berhasil dibatalkan" });
}));

// Upload Payment Proof
app.post('/api/orders/:id/payment', authenticateToken, upload.single('paymentProof'), catchAsync(async (req, res) => {
    const pool = await getPool();
    const orderId = req.params.id;
    
    if (!req.file) {
        return res.status(400).json({ error: "No payment proof uploaded" });
    }

    // Upload to Supabase Storage
    const fileExt = path.extname(req.file.originalname);
    const fileName = `proof-${orderId}-${Date.now()}${fileExt}`;
    const filePath = `payments/${fileName}`;

    const { data, error } = await supabase.storage
        .from('product-images') // Re-using the same bucket for simplicity, or create a new one 'payments'
        .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true
        });

    if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
    
    const proofUrl = publicUrlData.publicUrl;

    // Update database
    await pool.query(
        "UPDATE orders SET payment_status = $1, payment_proof_url = $2 WHERE id = $3",
        ['Pending Verification', proofUrl, orderId]
    );

    // Notification for admin
    await createNotification(1, `Bukti pembayaran baru diunggah untuk Pesanan #${orderId}`, 'payment');

    res.json({ message: "Payment proof uploaded successfully", proofUrl });
}));

// Update Payment Status (Admin)
app.put('/api/orders/:id/payment-status', authenticateToken, requireAdmin, catchAsync(async (req, res) => {
    const pool = await getPool();
    const { payment_status } = req.body;
    const { rows: orders } = await pool.query("UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING user_id", [payment_status, req.params.id]);
    
    if (orders.length > 0 && orders[0].user_id) {
        await createNotification(orders[0].user_id, `Pembayaran pesanan #${req.params.id} Anda: ${payment_status}`, 'payment_status');
    }

    res.json({ message: "Payment status updated" });
}));

// Delete Order (Admin Only)
app.delete('/api/orders/:id', authenticateToken, requireAdmin, catchAsync(async (req, res) => {
    const pool = await getPool();
    // Items will be deleted automatically due to ON DELETE CASCADE on order_id
    await pool.query("DELETE FROM orders WHERE id = $1", [req.params.id]);
    res.json({ message: "Order deleted successfully" });
}));

// --- Tracking Routes ---

app.post('/api/orders/:id/tracking', authenticateToken, requireAdmin, catchAsync(async (req, res) => {
    const pool = await getPool();
    const { status_update, location } = req.body;
    const orderId = req.params.id;

    await pool.query(
        "INSERT INTO tracking_logs (order_id, status_update, location) VALUES ($1, $2, $3)",
        [orderId, status_update, location]
    );

    // Auto-update order status to 'Dikirim' if it's the first update and was 'Diproses'
    const { rows: orders } = await pool.query("SELECT status, user_id FROM orders WHERE id = $1", [orderId]);
    if (orders[0].status === 'Diproses') {
        await pool.query("UPDATE orders SET status = 'Dikirim' WHERE id = $1", [orderId]);
    }

    if (orders[0].user_id) {
        await createNotification(orders[0].user_id, `Update Pengiriman #${orderId}: ${status_update} (${location || 'Transit'})`, 'tracking');
    }

    res.status(201).json({ message: "Tracking log added" });
}));

app.put('/api/orders/:id/tracking-info', authenticateToken, requireAdmin, catchAsync(async (req, res) => {
    const pool = await getPool();
    const { tracking_number, shipping_courier } = req.body;
    await pool.query(
        "UPDATE orders SET tracking_number = $1, shipping_courier = $2 WHERE id = $3",
        [tracking_number, shipping_courier, req.params.id]
    );
    res.json({ message: "Tracking info updated" });
}));


// --- Notification Routes ---

app.get('/api/notifications/:userId', authenticateToken, catchAsync(async (req, res) => {
    const pool = await getPool();
    const { rows } = await pool.query("SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50", [req.params.userId]);
    res.json(rows);
}));

app.put('/api/notifications/:id/read', authenticateToken, catchAsync(async (req, res) => {
    const pool = await getPool();
    await pool.query("UPDATE notifications SET is_read = TRUE WHERE id = $1", [req.params.id]);
    res.json({ message: "Notification marked as read" });
}));

app.put('/api/notifications/read-all/:userId', authenticateToken, catchAsync(async (req, res) => {
    const pool = await getPool();
    await pool.query("UPDATE notifications SET is_read = TRUE WHERE user_id = $1", [req.params.userId]);
    res.json({ message: "All notifications marked as read" });
}));


// Centralized Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err.message);
    res.status(500).json({ 
        error: err.message || "Internal Server Error"
    });
});

// Initialize and Start
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    initDatabase().then(() => {
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    }).catch(err => {
        console.error("Database initialization failed:", err);
    });
}

module.exports = app;

