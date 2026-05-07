const { getPool } = require('./config/db');

async function runMigration() {
    try {
        const pool = await getPool();
        console.log('Connected to database. Running migrations...');

        // 1. Create Notifications Table
        await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id),
            message TEXT NOT NULL,
            type VARCHAR(50),
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log('Notifications table checked/created.');

        // 2. Create Tracking Logs Table
        await pool.query(`CREATE TABLE IF NOT EXISTS tracking_logs (
            id SERIAL PRIMARY KEY,
            order_id INT REFERENCES orders(id) ON DELETE CASCADE,
            status_update TEXT NOT NULL,
            location VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log('Tracking Logs table checked/created.');

        // 3. Add columns to Orders table if they don't exist
        const addColumn = async (columnName, definition) => {
            try {
                await pool.query(`ALTER TABLE orders ADD COLUMN ${columnName} ${definition}`);
                console.log(`Column ${columnName} added to orders.`);
            } catch (err) {
                if (err.code === '42701') { // duplicate_column
                    console.log(`Column ${columnName} already exists in orders.`);
                } else {
                    throw err;
                }
            }
        };

        await addColumn('payment_status', "VARCHAR(20) DEFAULT 'Unpaid'");
        await addColumn('payment_proof_url', "TEXT");
        await addColumn('tracking_number', "VARCHAR(100)");
        await addColumn('shipping_courier', "VARCHAR(50)");

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

runMigration();
