const { getPool } = require('./config/db');

async function seedDatabase() {
    try {
        const pool = await getPool();
        console.log('Connected to Supabase. Seeding products...');

        const products = [
            {
                name: 'Aurumvice Navy Signature Blazer',
                description: 'A classic navy signature blazer from Aurumvice.',
                price: 250000,
                category: 'CLOTHING',
                image: '/uploads/blazer.png'
            },
            {
                name: 'Aurumvice Essential White Shirt',
                description: 'An essential white shirt for any wardrobe.',
                price: 200000,
                category: 'CLOTHING',
                image: '/uploads/shirt.png'
            },
            {
                name: 'Aurumvice Navy Classic Tailored Vest',
                description: 'A finely tailored navy classic vest.',
                price: 160000,
                category: 'CLOTHING',
                image: '/uploads/vest.png'
            },
            {
                name: 'Aurumvice Navy Tailored Classic Trousers',
                description: 'Classic tailored trousers in navy.',
                price: 250000,
                category: 'CLOTHING',
                image: '/uploads/trousers.png'
            },
            {
                name: 'AURUMVICE Navy Textured Slim Tie',
                description: 'A textured slim tie in navy.',
                price: 95000,
                category: 'ACCESSORIES',
                image: '/uploads/tie.png'
            }
        ];

        // Clear existing products before seeding
        await pool.query('DELETE FROM product_images');
        await pool.query('DELETE FROM products');

        for (const product of products) {
            const { rows } = await pool.query(
                "INSERT INTO products (name, description, price, category, image) VALUES ($1, $2, $3, $4, $5) RETURNING id",
                [product.name, product.description, product.price, product.category, product.image]
            );
            
            const productId = rows[0].id;
            if (product.image) {
                await pool.query(
                    "INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)",
                    [productId, product.image]
                );
            }
        }

        console.log('Products seeded successfully to Supabase.');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        process.exit();
    }
}

seedDatabase();
