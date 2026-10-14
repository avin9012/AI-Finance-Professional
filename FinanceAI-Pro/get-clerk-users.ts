import { config } from 'dotenv';
import fs from 'fs';

config({ path: '.env.local' });

async function getClerkUsers() {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) throw new Error('No CLERK_SECRET_KEY');

  const res = await fetch('https://api.clerk.com/v1/users', {
    headers: { 'Authorization': `Bearer ${secret}` }
  });
  
  const users = await res.json();
  if (users.length > 0) {
    const userId = users[0].id;
    console.log('Found user:', userId, users[0].email_addresses[0]?.email_address);
    let seedContent = fs.readFileSync('./scripts/seed.ts', 'utf8');
    seedContent = seedContent.replace(/const SEED_USER_ID = '.*';/, `const SEED_USER_ID = '${userId}';`);
    fs.writeFileSync('./scripts/seed.ts', seedContent);
    console.log(`Updated seed.ts with userId: ${userId}`);
  } else {
    console.log('No users found in Clerk. Please sign up in the app first.');
  }
}

getClerkUsers().catch(console.error);
