import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testLogin() {
  console.log("Testing generic login to check if Supabase Auth is broken...");
  
  // Create a dummy user
  const email = "test_login_issue_" + Date.now() + "@example.com";
  const password = "Password123!";
  
  console.log("Signing up:", email);
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (signupError) {
    console.error("Signup failed:", signupError);
  } else {
    console.log("Signup success:", signupData.user?.id);
  }
  
  console.log("Logging in...");
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (loginError) {
    console.error("Login failed:", loginError);
  } else {
    console.log("Login success:", loginData.user?.id);
  }
}

testLogin().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); })
