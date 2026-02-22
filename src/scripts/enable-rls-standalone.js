const { Client } = require('pg');
require('dotenv').config();

async function enableRLS() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL not found in .env");
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false // Required for Supabase in many environments
        }
    });

    try {
        await client.connect();
        console.log("Connected to database. Enabling RLS on all public tables...");

        const sql = `
      DO $$ 
      DECLARE 
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
          END LOOP;
      END $$;
    `;

        await client.query(sql);
        console.log("✅ Successfully enabled RLS on all tables in the public schema.");
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await client.end();
    }
}

enableRLS();
