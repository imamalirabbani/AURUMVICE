const { Pool } = require('pg');

const dbConfig = {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.fhljkxnptsbiopncbmmg:zdQrUSU%2F6AYepTz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
    ssl: {
        rejectUnauthorized: false
    }
};

let pool;

async function getPool() {
    if (!pool) {
        try {
            pool = new Pool(dbConfig);
            // Test the connection
            await pool.query('SELECT 1');
            console.log("Database connected successfully");
        } catch (err) {
            console.error("Database connection error details:", err.message);
            pool = null; // Reset so we can try again
            throw err;
        }
    }
    return pool;
}

async function initDatabase() {
    const p = await getPool();

    // Products Table
    await p.query(`CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(15,2) NOT NULL,
        category VARCHAR(255),
        image VARCHAR(255)
    )`);

    // Users Table
    await p.query(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address TEXT
    )`);

    // Cart Table
    await p.query(`CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        quantity INT
    )`);

    // Product Images Table
    await p.query(`CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        image_url VARCHAR(255)
    )`);

    // Orders Table
    await p.query(`CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        client_name VARCHAR(255),
        shipping_address TEXT,
        pic_name VARCHAR(255),
        phone_number VARCHAR(50),
        notes TEXT,
        payment_method VARCHAR(50),
        total_amount NUMERIC(15,2),
        status VARCHAR(20) DEFAULT 'Pending',
        payment_status VARCHAR(20) DEFAULT 'Unpaid',
        payment_proof_url TEXT,
        tracking_number VARCHAR(100),
        shipping_courier VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Order Items Table
    await p.query(`CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id),
        quantity INT,
        price_at_purchase NUMERIC(15,2)
    )`);

    // Tracking Logs Table
    await p.query(`CREATE TABLE IF NOT EXISTS tracking_logs (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        status_update TEXT NOT NULL,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Notifications Table
    await p.query(`CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        message TEXT NOT NULL,
        type VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // About Content Table
    await p.query(`CREATE TABLE IF NOT EXISTS about_content (
        section_key VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255),
        description TEXT
    )`);

    // Add missing columns to orders if they don't exist
    const columns = [
        { name: 'payment_status', def: "VARCHAR(20) DEFAULT 'Unpaid'" },
        { name: 'payment_proof_url', def: "TEXT" },
        { name: 'tracking_number', def: "VARCHAR(100)" },
        { name: 'shipping_courier', def: "VARCHAR(50)" }
    ];

    for (const col of columns) {
        try {
            await p.query(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.def}`);
        } catch (err) {
            // Ignore if column already exists (error code 42701)
        }
    }

    // Insert default about content if empty
    const { rows: aboutRows } = await p.query("SELECT * FROM about_content");
    if (aboutRows.length === 0) {
        await p.query(`INSERT INTO about_content (section_key, title, description) VALUES 
            ('excellence', 'Excellence', 'We settle for nothing less than the best in every product we offer.'),
            ('integrity', 'Integrity', 'Transparency and trust are the foundations of our relationship with you.'),
            ('innovation', 'Innovation', 'Constantly seeking new ways to enhance your shopping experience.')
        `);
    }

    // Insert default admin user if empty
    const { rows: userRows } = await p.query("SELECT * FROM users WHERE username = $1", ['admin']);
    if (userRows.length === 0) {
        await p.query(
            "INSERT INTO users (username, email, password, address) VALUES ($1, $2, $3, $4)",
            ['admin', 'admin@aurumvice.com', 'admin123', 'AURUMVICE HQ']
        );
        console.log("Default admin user created: admin / admin123");
    }
}

module.exports = { getPool, initDatabase };

