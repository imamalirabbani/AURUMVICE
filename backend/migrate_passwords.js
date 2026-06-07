const { getPool } = require('./config/db');
const bcrypt = require('bcryptjs');

async function migratePasswords() {
    try {
        const pool = await getPool();
        console.log('Terhubung ke database. Memulai migrasi password...');

        // Ambil semua user
        const { rows: users } = await pool.query('SELECT id, username, email, password FROM users');
        console.log(`Ditemukan ${users.length} user.`);

        let migratedCount = 0;
        for (const user of users) {
            // Cek apakah password sudah di-hash (bcrypt hash selalu dimulai dengan $2a$ atau $2b$)
            if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
                console.log(`[SKIP] ${user.username} (${user.email}) - password sudah di-hash.`);
                continue;
            }

            // Hash password plaintext
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
            console.log(`[OK] ${user.username} (${user.email}) - password berhasil di-hash.`);
            migratedCount++;
        }

        console.log(`\nMigrasi selesai. ${migratedCount} password di-hash.`);
    } catch (err) {
        console.error('Migrasi password gagal:', err);
    } finally {
        process.exit();
    }
}

migratePasswords();
