const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getPool, initDatabase } = require('./config/db');
const { supabase } = require('./config/supabase');


const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

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

// --- Routes ---

// Get all products
app.get('/api/products', catchAsync(async (req, res) => {
    const pool = await getPool();
    const { search, category } = req.query;
    let query = "SELECT * FROM products";
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

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }

    const { rows } = await pool.query(query, params);
    
    const productsWithImages = await Promise.all(rows.map(async (product) => {
        const { rows: images } = await pool.query("SELECT image_url FROM product_images WHERE product_id = $1", [product.id]);
        return { ...product, images: images.map(img => img.image_url) };
    }));
    
    res.json(productsWithImages);
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
app.post('/api/products', upload.array('imageFiles', 5), catchAsync(async (req, res) => {
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
app.delete('/api/products/:id', catchAsync(async (req, res) => {
    const pool = await getPool();
    await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.json({ message: "Product deleted successfully" });
}));

// Update product
app.put('/api/products/:id', upload.array('imageFiles', 5), catchAsync(async (req, res) => {
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
app.get('/api/cart', catchAsync(async (req, res) => {
    const pool = await getPool();
    const query = `
        SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image 
        FROM cart c 
        JOIN products p ON c.product_id = p.id
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
}));

app.post('/api/cart', catchAsync(async (req, res) => {
    const pool = await getPool();
    const { product_id, quantity } = req.body;
    const { rows } = await pool.query("SELECT * FROM cart WHERE product_id = $1", [product_id]);
    
    if (rows.length > 0) {
        await pool.query("UPDATE cart SET quantity = quantity + $1 WHERE id = $2", [quantity, rows[0].id]);
        res.json({ message: "Cart updated" });
    } else {
        const { rows: result } = await pool.query("INSERT INTO cart (product_id, quantity) VALUES ($1, $2) RETURNING id", [product_id, quantity]);
        res.status(201).json({ id: result[0].id });
    }
}));

app.delete('/api/cart/:id', catchAsync(async (req, res) => {
    const pool = await getPool();
    await pool.query("DELETE FROM cart WHERE id = $1", [req.params.id]);
    res.json({ message: "Item removed from cart" });
}));

app.delete('/api/cart', catchAsync(async (req, res) => {
    const pool = await getPool();
    await pool.query("DELETE FROM cart");
    res.json({ message: "Cart cleared" });
}));

// --- Auth Routes ---
app.post('/api/register', catchAsync(async (req, res) => {
    const pool = await getPool();
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "Missing fields" });

    const { rows } = await pool.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id", [username, email, password]);
    res.status(201).json({ id: rows[0].id, username, email });
}));

app.post('/api/login', catchAsync(async (req, res) => {
    const pool = await getPool();
    const { email, password } = req.body;
    const { rows } = await pool.query("SELECT id, username, email, address FROM users WHERE email = $1 AND password = $2", [email, password]);
    
    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ message: "Login successful", user: rows[0] });
}));

// --- Profile Routes ---
app.get('/api/users/:id', catchAsync(async (req, res) => {
    const pool = await getPool();
    const { rows } = await pool.query("SELECT id, username, email, address FROM users WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
}));

app.put('/api/users/:id', catchAsync(async (req, res) => {
    const pool = await getPool();
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

app.put('/api/about', catchAsync(async (req, res) => {
    const pool = await getPool();
    for (const [key, data] of Object.entries(req.body)) {
        await pool.query("UPDATE about_content SET title = $1, description = $2 WHERE section_key = $3", [data.title, data.description, key]);
    }
    res.json({ message: "About content updated" });
}));


// --- Order Routes ---

// Create Order (Checkout)
app.post('/api/orders', catchAsync(async (req, res) => {
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

    // 3. Clear cart (optional: if user_id is provided, we might want to clear specific cart items, 
    // but here we just clear the global cart for simplicity as the current system doesn't have multi-user cart isolation yet)
    await pool.query("DELETE FROM cart");

    res.status(201).json({ id: orderId, message: "Order placed successfully" });
}));

// Get all orders (Admin)
app.get('/api/orders', catchAsync(async (req, res) => {
    const pool = await getPool();
    const { rows: orders } = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    
    // Enrich with items
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const { rows: items } = await pool.query(`
            SELECT oi.*, p.name, p.image 
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = $1
        `, [order.id]);
        return { ...order, items };
    }));

    res.json(ordersWithItems);
}));

// Get single order details
app.get('/api/orders/:id', catchAsync(async (req, res) => {
    const pool = await getPool();
    const { rows: orders } = await pool.query("SELECT * FROM orders WHERE id = $1", [req.params.id]);
    
    if (orders.length === 0) return res.status(404).json({ error: "Order not found" });
    
    const { rows: items } = await pool.query(`
        SELECT oi.*, p.name, p.image 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = $1
    `, [req.params.id]);

    res.json({ ...orders[0], items });
}));

// Update order status (Admin)
app.put('/api/orders/:id/status', catchAsync(async (req, res) => {
    const pool = await getPool();
    const { status } = req.body;
    await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [status, req.params.id]);
    res.json({ message: "Order status updated" });
}));


// Centralized Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err.message);
    res.status(500).json({ 
        error: err.message || "Internal Server Error",
        details: process.env.VERCEL ? "Check Vercel logs or database connection" : err.stack
    });
});

let isDbInitialized = false;
app.use(async (req, res, next) => {
    if (process.env.VERCEL && !isDbInitialized) {
        try {
            await initDatabase();
            isDbInitialized = true;
        } catch (err) {
            console.error("Lazy DB Init Error:", err);
        }
    }
    next();
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

