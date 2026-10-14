import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { accounts, transactions } from './db/schema';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function check() {
  const allAccounts = await db.select().from(accounts).execute();
  console.log('Accounts in DB:', allAccounts);

  const txCount = await db.select().from(transactions).execute();
  console.log(`Transactions in DB: ${txCount.length}`);
}

check().catch(console.error);
