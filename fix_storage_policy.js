const { getPool } = require('./backend/config/db');

async function createBucket() {
    try {
        const pool = await getPool();
        console.log("Creating storage bucket if not exists...");
        
        // 1. Create the bucket in the storage.buckets table
        await pool.query(`
            INSERT INTO storage.buckets (id, name, public) 
            VALUES ('product-images', 'product-images', true) 
            ON CONFLICT (id) DO UPDATE SET public = true;
        `);
        
        // 2. Add Select Policy
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies 
                    WHERE tablename = 'objects' 
                    AND schemaname = 'storage' 
                    AND policyname = 'Public Access'
                ) THEN
                    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
                END IF;
            END
            $$;
        `);

        // 3. Add Insert Policy (so we can upload)
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies 
                    WHERE tablename = 'objects' 
                    AND schemaname = 'storage' 
                    AND policyname = 'Public Insert'
                ) THEN
                    CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
                END IF;
            END
            $$;
        `);
        
        console.log("Bucket created and policies updated successfully!");
    } catch (err) {
        console.error("Error creating bucket:", err.message);
    } finally {
        process.exit();
    }
}

createBucket();
