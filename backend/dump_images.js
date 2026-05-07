const { getPool } = require('./config/db');

async function checkImages() {
    try {
        const pool = await getPool();
        
        console.log('--- Products Main Image ---');
        const [products] = await pool.query("SELECT id, name, image FROM products");
        products.forEach(p => console.log(`ID ${p.id}: ${p.name} -> ${p.image}`));

        console.log('\n--- Product Images Table ---');
        const [images] = await pool.query("SELECT product_id, image_url FROM product_images");
        images.forEach(img => console.log(`ProductID ${img.product_id}: ${img.image_url}`));

    } catch (err) {
        console.error('Error:', err);
    }
}

checkImages();
