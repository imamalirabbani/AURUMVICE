const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 6543,
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
    console.log("Starting initDatabase...");
    const p = await getPool();
    console.log("Pool acquired for initDatabase");

    const runQuery = async (name, query) => {
        try {
            await p.query(query);
            console.log(`Success: ${name}`);
        } catch (err) {
            console.error(`Failed: ${name}`, err.message);
            // Re-throw if it's not a "already exists" error
            if (!err.message.includes('already exists')) throw err;
        }
    };

    await runQuery("Products Table", `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(15,2) NOT NULL,
        category VARCHAR(255),
        image VARCHAR(255)
    )`);

    await runQuery("Users Table", `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await runQuery("Cart Table", `CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        quantity INT
    )`);

    await runQuery("Product Images Table", `CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        image_url VARCHAR(255)
    )`);

    await runQuery("Orders Table", `CREATE TABLE IF NOT EXISTS orders (
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

    await runQuery("Order Items Table", `CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id),
        quantity INT,
        price_at_purchase NUMERIC(15,2)
    )`);

    await runQuery("Tracking Logs Table", `CREATE TABLE IF NOT EXISTS tracking_logs (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        status_update TEXT NOT NULL,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await runQuery("Notifications Table", `CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        message TEXT NOT NULL,
        type VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await runQuery("About Content Table", `CREATE TABLE IF NOT EXISTS about_content (
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
            console.log(`Column ${col.name} added to orders.`);
        } catch (err) {
            // Ignore if column already exists
        }
    }

    // Add created_at to users if missing
    try {
        await p.query("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        console.log("Column created_at added to users.");
    } catch (err) {
        // Ignore if exists
    }

    // Add user_id to cart if missing
    try {
        await p.query("ALTER TABLE cart ADD COLUMN user_id INT REFERENCES users(id) ON DELETE CASCADE");
        console.log("Column user_id added to cart.");
    } catch (err) {
        // Ignore if exists
    }

    // Default Data
    try {
        const { rows: aboutRows } = await p.query("SELECT * FROM about_content");
        if (aboutRows.length === 0) {
            await p.query(`INSERT INTO about_content (section_key, title, description) VALUES 
                ('excellence', 'Excellence', 'We settle for nothing less than the best in every product we offer.'),
                ('integrity', 'Integrity', 'Transparency and trust are the foundations of our relationship with you.'),
                ('innovation', 'Innovation', 'Constantly seeking new ways to enhance your shopping experience.')
            `);
        }

        const { rows: userRows } = await p.query("SELECT * FROM users WHERE username = $1", ['admin']);
        if (userRows.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            await p.query(
                "INSERT INTO users (username, email, password, address) VALUES ($1, $2, $3, $4)",
                ['admin', 'admin@aurumvice.com', hashedPassword, 'AURUMVICE HQ']
            );
            console.log("Default admin user created (password hashed)");
        } else {
            // Migrasi otomatis: jika password admin masih plaintext, hash ulang
            const adminUser = userRows[0];
            if (!adminUser.password.startsWith('$2a$') && !adminUser.password.startsWith('$2b$')) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(adminUser.password, salt);
                await p.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, adminUser.id]);
                console.log("Admin password migrated from plaintext to hashed");
            }
        }

        // Migrasi otomatis: hash semua password user yang masih plaintext
        const { rows: allUsers } = await p.query("SELECT id, username, password FROM users");
        for (const u of allUsers) {
            if (!u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(u.password, salt);
                await p.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, u.id]);
                console.log(`Password for user "${u.username}" migrated to hashed`);
            }
        }
    } catch (err) {
        console.error("Default data insertion failed:", err.message);
    }
}

module.exports = { getPool, initDatabase };

