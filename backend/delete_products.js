const { getPool } = require('./config/db');

async function deleteProducts() {
    try {
        const pool = await getPool();
        console.log('Connecting to database...');
        
        // Deleting cart items first due to foreign key constraints if any (though ON DELETE CASCADE is set)
        console.log('Deleting cart items...');
        await pool.query('DELETE FROM cart');
        
        console.log('Deleting product images...');
        await pool.query('DELETE FROM product_images');
        
        console.log('Deleting all products...');
        await pool.query('DELETE FROM products');
        
        console.log('All products and related data deleted successfully.');
    } catch (err) {
        console.error('Error deleting products:', err);
    } finally {
        process.exit();
    }
}

deleteProducts();
