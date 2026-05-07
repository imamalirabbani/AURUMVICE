const mysql = require('mysql2/promise');

async function seedDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'qwerty200603',
            database: 'web_jual_beli'
        });

        console.log('Connected to database. Seeding products...');

        const products = [
            {
                name: 'Aurumvice Navy Signature Blazer',
                description: 'A classic navy signature blazer from Aurumvice.',
                price: 250000,
                category: 'CLOTHING',
                image: '/uploads/imageFiles-1778064152539-33785960.png'
            },
            {
                name: 'Aurumvice Essential White Shirt',
                description: 'An essential white shirt for any wardrobe.',
                price: 200000,
                category: 'CLOTHING',
                image: '/uploads/imageFiles-1778064152617-166444538.png'
            },
            {
                name: 'Aurumvice Navy Classic Tailored Vest',
                description: 'A finely tailored navy classic vest.',
                price: 160000,
                category: 'CLOTHING',
                image: '/uploads/imageFiles-1778064152639-931470489.png'
            },
            {
                name: 'Aurumvice Navy Tailored Classic Trousers',
                description: 'Classic tailored trousers in navy.',
                price: 250000,
                category: 'CLOTHING',
                image: '/uploads/imageFiles-1778064152648-320814441.png'
            },
            {
                name: 'AURUMVICE Navy Textured Slim Tie',
                description: 'A textured slim tie in navy.',
                price: 95000,
                category: 'ACCESSORIES',
                image: '/uploads/imageFiles-1778064152539-33785960.png'
            }
        ];

        // Clear existing products before seeding
        try { await connection.query('DELETE FROM product_images'); } catch(e) {}
        await connection.query('DELETE FROM products');

        for (const product of products) {
            const [result] = await connection.query(
                "INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)",
                [product.name, product.description, product.price, product.category, product.image]
            );
            
            const productId = result.insertId;
            if (product.image) {
                await connection.query(
                    "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)",
                    [productId, product.image]
                );
            }
        }

        console.log('Products seeded successfully.');
        await connection.end();
    } catch (err) {
        console.error('Error seeding database:', err);
    }
}

seedDatabase();
