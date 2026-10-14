import { config } from 'dotenv';

config({ path: '.env.local' });

async function getClerkUsers() {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) throw new Error('No CLERK_SECRET_KEY');

  const res = await fetch('https://api.clerk.com/v1/users', {
    headers: { 'Authorization': `Bearer ${secret}` }
  });
  
  const users = await res.json();
  console.log('Clerk users:', users.map((u: any) => ({
    id: u.id,
    email: u.email_addresses[0]?.email_address
  })));
}

getClerkUsers().catch(console.error);
