const { getPool } = require('./config/db');

async function seedClient() {
    try {
        const pool = await getPool();
        console.log('Connected to database. Seeding sample client...');

        const client = {
            username: 'client_luxury',
            email: 'client@luxury.com',
            password: 'password123',
            address: 'Jl. Sudirman No. 1, Jakarta Pusat, DKI Jakarta 10210'
        };

        // Check if user already exists
        const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1", [client.email]);
        
        if (existing.length > 0) {
            console.log('Sample client already exists.');
        } else {
            await pool.query(
                "INSERT INTO users (username, email, password, address) VALUES ($1, $2, $3, $4)",
                [client.username, client.email, client.password, client.address]
            );
            console.log('Sample client created successfully:');
            console.log(`Email: ${client.email}`);
            console.log(`Password: ${client.password}`);
        }

    } catch (err) {
        console.error('Error seeding client:', err);
    } finally {
        process.exit();
    }
}

seedClient();
