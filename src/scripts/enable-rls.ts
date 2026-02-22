import { ExecArgs } from "@medusajs/framework/types"

export default async function enableRLS({ container }: ExecArgs) {
    const pgConnection = container.resolve("pg_connection")

    console.log("Enabling RLS on all public tables...")

    const sql = `
    DO $$ 
    DECLARE 
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
        END LOOP;
    END $$;
  `

    try {
        await (pgConnection as any).query(sql)
        console.log("✅ Successfully enabled RLS on all tables in the public schema.")
        console.log("Note: This hides tables from the public Supabase API, but Medusa backend continues to have full access.")
    } catch (error) {
        console.error("❌ Failed to enable RLS:", error)
    }
}
