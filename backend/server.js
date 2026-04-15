const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
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
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database.');
        // Initialize tables
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                category TEXT,
                image TEXT
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                quantity INTEGER,
                FOREIGN KEY(product_id) REFERENCES products(id)
            )`);

            // Check if seeded
            db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
                if (row && row.count === 0) {
                    const seedProducts = [
                        { name: "Premium Wireless Headphones", description: "High quality noise cancelling headphones with deep bass.", price: 1500000, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
                        { name: "Minimalist Smart Watch", description: "Sleek and professional smartwatch with fitness tracking.", price: 2100000, category: "Electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" },
                        { name: "Aesthetic Desk Lamp", description: "Modern LED desk lamp perfect for late night study sessions.", price: 450000, category: "Home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80" },
                        { name: "Classic Leather Backpack", description: "Durable and stylish backpack for everyday use.", price: 850000, category: "Fashion", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80" },
                        { name: "Kamera Mirrorless Pro", description: "Kamera digital untuk fotografi profesional dan vlogging.", price: 12500000, category: "Electronics", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80" },
                        { name: "Sofa Minimalis Modern", description: "Sofa nyaman 3 seater berbahan fabric premium untuk ruang keluarga.", price: 3500000, category: "Home", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80" },
                        { name: "Sepeda Gunung MTB", description: "Sepeda gunung tangguh dengan suspensi empuk untuk segala medan.", price: 4200000, category: "Sports", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80" },
                        { name: "Laptop Gaming Ultimate", description: "Performa maksimal untuk gaming dan desain grafis berat.", price: 24000000, category: "Electronics", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" },
                        { name: "Sepatu Sneakers Klasik", description: "Sneakers kasual yang cocok dipakai untuk gaya sehari-hari.", price: 650000, category: "Fashion", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80" },
                        { name: "Vespa Matic Vintage", description: "Skuter matic berdesain klasik dengan performa injeksi modern.", price: 45000000, category: "Vehicles", image: "https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=800&q=80" },
                        { name: "Panci Set Anti Lengket", description: "Set alat masak premium yang bebas racun dan mudah dibersihkan.", price: 890000, category: "Home", image: "https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80" },
                        { name: "Jaket Parka Outdoor", description: "Jaket anti angin dan air, cocok untuk pendakian gunung atau touring.", price: 750000, category: "Fashion", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80" },
                        { name: "Mechanical Keyboard RGB", description: "Keyboard mekanik tactile dengan pencahayaan RGB customizable.", price: 1200000, category: "Electronics", image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80" },
                        { name: "Monitor 4K Curved", description: "Monitor lengkung resolusi 4K untuk pengalaman visual imersif.", price: 5500000, category: "Electronics", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80" },
                        { name: "Smart Air Purifier", description: "Pembersih udara pintar untuk menjaga kualitas udara di rumah.", price: 2800000, category: "Home", image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=800&q=80" },
                        { name: "Electric Guitar Sunburst", description: "Gitar elektrik gaya klasik dengan warna sunburst yang ikonik.", price: 6800000, category: "Music", image: "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&w=800&q=80" },
                        { name: "Drone 4K Compact", description: "Drone lipat dengan kamera 4K untuk menangkap momen dari udara.", price: 9500000, category: "Electronics", image: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=800&q=80" },
                        { name: "Leather Office Chair", description: "Kursi kantor ergonomis berbahan kulit untuk kenyamanan bekerja.", price: 2200000, category: "Home", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80" }
                    ];

                    const stmt = db.prepare("INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)");
                    seedProducts.forEach(p => {
                        stmt.run(p.name, p.description, p.price, p.category, p.image);
                    });
                    stmt.finalize();
                }
            });
        });
    }
});

// Routes

// Get all products
app.get('/api/products', (req, res) => {
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

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    db.get("SELECT * FROM products WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(row);
    });
});

// Create product
app.post('/api/products', upload.single('imageFile'), (req, res) => {
    const { name, description, price, category, image } = req.body;
    let imageUrl = image;
    
    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    }

    db.run(
        "INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)",
        [name, description, price, category, imageUrl],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, name, description, price, category, image: imageUrl });
        }
    );
});

// Cart Routes
app.get('/api/cart', (req, res) => {
    const query = `
        SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image 
        FROM cart c 
        JOIN products p ON c.product_id = p.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/api/cart', (req, res) => {
    const { product_id, quantity } = req.body;
    
    // Check if product already in cart
    db.get("SELECT * FROM cart WHERE product_id = ?", [product_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (row) {
            // Update quantity
            db.run("UPDATE cart SET quantity = quantity + ? WHERE id = ?", [quantity, row.id], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Cart updated" });
            });
        } else {
            // Insert new
            db.run("INSERT INTO cart (product_id, quantity) VALUES (?, ?)", [product_id, quantity], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ id: this.lastID, product_id, quantity });
            });
        }
    });
});

app.delete('/api/cart/:id', (req, res) => {
    db.run("DELETE FROM cart WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Item removed from cart" });
    });
});

app.delete('/api/cart', (req, res) => {
    db.run("DELETE FROM cart", [], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Cart cleared" });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
