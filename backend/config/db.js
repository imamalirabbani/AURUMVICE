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
        pool = new Pool(dbConfig);
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

    // About Content Table
    await p.query(`CREATE TABLE IF NOT EXISTS about_content (
        section_key VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255),
        description TEXT
    )`);

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

