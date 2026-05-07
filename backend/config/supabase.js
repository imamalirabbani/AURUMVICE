const { Pool } = require('pg');

/**
 * INSTRUCTIONS:
 * 1. Go to your Supabase Project -> Project Settings -> Database.
 * 2. Find the "Connection string" section and copy the "URI".
 * 3. Replace the placeholder below with your actual URI.
 * 4. Usually looks like: postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres
 */

const connectionString = 'YOUR_SUPABASE_CONNECTION_STRING_HERE';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  }
});

async function initSupabase() {
    // This function will ensure tables exist in Supabase
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price NUMERIC(15,2) NOT NULL,
                category VARCHAR(255),
                image VARCHAR(255)
            );

            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                address TEXT
            );

            CREATE TABLE IF NOT EXISTS cart (
                id SERIAL PRIMARY KEY,
                product_id INT REFERENCES products(id) ON DELETE CASCADE,
                quantity INT
            );

            CREATE TABLE IF NOT EXISTS product_images (
                id SERIAL PRIMARY KEY,
                product_id INT REFERENCES products(id) ON DELETE CASCADE,
                image_url VARCHAR(255)
            );

            CREATE TABLE IF NOT EXISTS about_content (
                section_key VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255),
                description TEXT
            );
        `);
        console.log('Supabase tables initialized.');
    } finally {
        client.release();
    }
}

module.exports = { pool, initSupabase };
