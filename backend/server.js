const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Setup uploads folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Static serve for uploads
app.use('/uploads', express.static(uploadDir));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
});
const upload = multer({ storage: storage });

// Database setup
let pool;

async function setupDatabase() {
    try {
        // First, connect without database selected to create it if it doesn't exist
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'qwerty200603'
        });
        
        await connection.query("CREATE DATABASE IF NOT EXISTS `web_jual_beli`");
        await connection.end();

        // Now create a pool with the database selected
        pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 'qwerty200603',
            database: 'web_jual_beli',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('Connected to MySQL database.');

        // Initialize tables
        await pool.query(`CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(15,2) NOT NULL,
            category VARCHAR(255),
            image VARCHAR(255)
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS cart (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT,
            quantity INT,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS product_images (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT,
            image_url VARCHAR(255),
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        )`);

    } catch (err) {
        console.error('Error setting up database:', err);
    }
}

setupDatabase();

// Routes

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = "SELECT * FROM products";
        let params = [];
        
        let conditions = [];
        if (search) {
            conditions.push("name LIKE ?");
            params.push(`%${search}%`);
        }
        if (category) {
            conditions.push("category = ?");
            params.push(category);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        const [rows] = await pool.query(query, params);
        
        // Fetch images for each product
        const productsWithImages = await Promise.all(rows.map(async (product) => {
            const [images] = await pool.query("SELECT image_url FROM product_images WHERE product_id = ?", [product.id]);
            return { ...product, images: images.map(img => img.image_url) };
        }));
        
        res.json(productsWithImages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        const [images] = await pool.query("SELECT image_url FROM product_images WHERE product_id = ?", [req.params.id]);
        const product = { ...rows[0], images: images.map(img => img.image_url) };
        
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create product
app.post('/api/products', upload.array('imageFiles', 5), async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        
        // Use the first image as the main thumbnail in the products table (for backward compatibility/legacy)
        const mainImage = req.files && req.files.length > 0 ? `/uploads/${req.files[0].filename}` : '';

        const [result] = await pool.query(
            "INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)",
            [name, description, price, category, mainImage]
        );
        
        const productId = result.insertId;

        // Insert all images into product_images table
        if (req.files && req.files.length > 0) {
            const imageValues = req.files.map(file => [productId, `/uploads/${file.filename}`]);
            await pool.query("INSERT INTO product_images (product_id, image_url) VALUES ?", [imageValues]);
        }
        
        res.status(201).json({ id: productId, name, description, price, category, mainImage });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update product
app.put('/api/products/:id', upload.array('imageFiles', 5), async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        
        await pool.query(
            "UPDATE products SET name = ?, description = ?, price = ?, category = ? WHERE id = ?",
            [name, description, price, category, req.params.id]
        );

        // If new images were uploaded, replace old ones
        if (req.files && req.files.length > 0) {
            const mainImage = `/uploads/${req.files[0].filename}`;
            await pool.query("UPDATE products SET image = ? WHERE id = ?", [mainImage, req.params.id]);
            
            // Remove old images from product_images table
            await pool.query("DELETE FROM product_images WHERE product_id = ?", [req.params.id]);
            
            // Insert new images
            const imageValues = req.files.map(file => [req.params.id, `/uploads/${file.filename}`]);
            await pool.query("INSERT INTO product_images (product_id, image_url) VALUES ?", [imageValues]);
        }

        res.json({ message: "Product updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cart Routes
app.get('/api/cart', async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image 
            FROM cart c 
            JOIN products p ON c.product_id = p.id
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cart', async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        
        // Check if product already in cart
        const [rows] = await pool.query("SELECT * FROM cart WHERE product_id = ?", [product_id]);
        
        if (rows.length > 0) {
            // Update quantity
            await pool.query("UPDATE cart SET quantity = quantity + ? WHERE id = ?", [quantity, rows[0].id]);
            res.json({ message: "Cart updated" });
        } else {
            // Insert new
            const [result] = await pool.query("INSERT INTO cart (product_id, quantity) VALUES (?, ?)", [product_id, quantity]);
            res.status(201).json({ id: result.insertId, product_id, quantity });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/cart/:id', async (req, res) => {
    try {
        await pool.query("DELETE FROM cart WHERE id = ?", [req.params.id]);
        res.json({ message: "Item removed from cart" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/cart', async (req, res) => {
    try {
        await pool.query("DELETE FROM cart");
        res.json({ message: "Cart cleared" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Auth Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const [result] = await pool.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, password]
        );
        res.status(201).json({ id: result.insertId, username, email });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Username or email already exists" });
        }
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query(
            "SELECT id, username, email FROM users WHERE email = ? AND password = ?",
            [email, password]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        res.json({ message: "Login successful", user: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
