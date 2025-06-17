import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
        "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Please check your .env file."
    );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabase;
