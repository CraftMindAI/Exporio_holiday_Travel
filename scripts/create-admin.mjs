import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  const email = 'admin@exporio.com';
  const password = 'admin@123'; // Must be at least 6 chars

  console.log(`Creating/Migrating admin user: ${email}`);

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  });

  if (error) {
    if (error.code === 'email_exists' || error.message.includes("already registered") || error.message.includes("already exists")) {
       console.log("Admin user already exists in Auth!");
       // Let's update the password just in case
       const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
       const user = usersData.users.find(u => u.email === email);
       if (user) {
         await supabaseAdmin.auth.admin.updateUserById(user.id, { password: password });
         console.log("Updated existing admin user password to match.");
       }
    } else {
       console.error("Error creating user:", error);
    }
  } else {
    console.log("Admin user created successfully in Supabase Auth!");
  }
  
  console.log("\n---");
  console.log("You can now login with:");
  console.log("Email: " + email);
  console.log("Password: " + password);
  console.log("---\n");
}

createAdmin();
