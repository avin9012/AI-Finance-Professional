import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eachDayOfInterval, format, subDays } from 'date-fns';
import { accounts, categories, transactions } from '@/db/schema';
import { convertAmountToMiliuinits } from '@/lib/utils';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const SEED_USER_ID = 'user_3FVNyxJb9evEI2qXtA2USZXAk9y';

const SEED_CATEGORIES = [
  { id: 'category_1', name: 'Food', userId: SEED_USER_ID, plaidId: null },
  { id: 'category_2', name: 'Rent', userId: SEED_USER_ID, plaidId: null },
  { id: 'category_3', name: 'Utilities', userId: SEED_USER_ID, plaidId: null },
  { id: 'category_4', name: 'Transportation', userId: SEED_USER_ID, plaidId: null },
  { id: 'category_5', name: 'Health', userId: SEED_USER_ID, plaidId: null },
  { id: 'category_6', name: 'Entertainment', userId: SEED_USER_ID, plaidId: null },
  { id: 'category_7', name: 'Clothing', userId: SEED_USER_ID, plaidId: null },
  { id: 'category_8', name: 'Miscellaneous', userId: SEED_USER_ID, plaidId: null },
  { id: 'category_9', name: 'Education', userId: SEED_USER_ID, plaidId: null },
  { id: 'category_10', name: 'Personal Care', userId: SEED_USER_ID, plaidId: null },
  { id: 'category_11', name: 'Income', userId: SEED_USER_ID, plaidId: null },
];

const SEED_ACCOUNTS = [
  { id: 'account_1', name: 'Checking', userId: SEED_USER_ID, plaidId: null },
  { id: 'account_2', name: 'Savings', userId: SEED_USER_ID, plaidId: null },
];

const defaultTo = new Date();
const defaultFrom = subDays(defaultTo, 90);

const SEED_TRANSACTIONS: Omit<typeof transactions.$inferSelect, 'createdAt' | 'updatedAt'>[] = [];

const generateRandomAmount = (category: typeof categories.$inferInsert) => {
  switch (category.name) {
    case 'Rent':
      return Math.random() * 400 + 900; // Rent is larger
    case 'Utilities':
      return Math.random() * 200 + 50;
    case 'Food':
      return Math.random() * 30 + 10;
    case 'Transportation':
    case 'Health':
      return Math.random() * 50 + 15;
    case 'Entertainment':
    case 'Clothing':
    case 'Miscellaneous':
      return Math.random() * 100 + 20;
    case 'Income':
      return Math.random() * 1000 + 2500; // Salary or freelance
    default:
      return Math.random() * 50 + 10;
  }
};

const getPayeeForCategory = (categoryName: string) => {
  const payees: Record<string, string[]> = {
    'Food': ['Starbucks', 'McDonalds', 'Whole Foods', "Trader Joe's", 'Dominos', 'Local Cafe'],
    'Rent': ['Apartment Complex', 'Property Management'],
    'Utilities': ['Electric Co', 'Water Dept', 'Internet Provider'],
    'Transportation': ['Uber', 'Lyft', 'Gas Station', 'Subway Transit'],
    'Health': ['CVS Pharmacy', 'Dentist', 'Doctor Clinic'],
    'Entertainment': ['Netflix', 'Spotify', 'AMC Theaters', 'Steam'],
    'Clothing': ['H&M', 'Zara', 'Nike Store', 'Uniqlo'],
    'Miscellaneous': ['Amazon', 'Target', 'Walmart'],
    'Education': ['Coursera', 'Udemy', 'University Bookstore'],
    'Personal Care': ['Sephora', 'Barbershop', 'Salon'],
    'Income': ['Employer Inc', 'Upwork', 'Freelance Client']
  };
  const options = payees[categoryName] || ['Merchant'];
  return options[Math.floor(Math.random() * options.length)];
};

const generateTransactionsForDay = (day: Date) => {
  const numTransactions = Math.floor(Math.random() * 5) + 2; // 2 to 6 transactions per day
  for (let i = 0; i < numTransactions; i++) {
    const category = SEED_CATEGORIES[Math.floor(Math.random() * (SEED_CATEGORIES.length - 1))]; // Exclude Income for random expenses
    const amount = generateRandomAmount(category);
    const formattedAmount = convertAmountToMiliuinits(-amount); // Negative for expenses

    SEED_TRANSACTIONS.push({
      id: `transaction_${format(day, 'yyyy-MM-dd')}_${i}`,
      accountId: SEED_ACCOUNTS[0].id,
      categoryId: category.id,
      date: day,
      amount: formattedAmount,
      payee: getPayeeForCategory(category.name),
      notes: 'Random Transaction',
    });
  }

  // Add Income occasionally (e.g., ~10% chance per day)
  if (Math.random() > 0.9) {
    const incomeCategory = SEED_CATEGORIES.find(c => c.name === 'Income')!;
    const incomeAmount = generateRandomAmount(incomeCategory);
    SEED_TRANSACTIONS.push({
      id: `transaction_${format(day, 'yyyy-MM-dd')}_income`,
      accountId: SEED_ACCOUNTS[0].id,
      categoryId: incomeCategory.id,
      date: day,
      amount: convertAmountToMiliuinits(incomeAmount), // Positive for income
      payee: getPayeeForCategory('Income'),
      notes: 'Salary/Freelance',
    });
  }
};

const generateTransactions = () => {
  const days = eachDayOfInterval({ start: defaultFrom, end: defaultTo });
  days.forEach(day => {
    generateTransactionsForDay(day);
  });
};

generateTransactions();

const main = async () => {
  try {
    console.log('Resetting database...');
    await db.delete(transactions).execute();
    await db.delete(accounts).execute();
    await db.delete(categories).execute();
    
    console.log('Seeding categories...');
    await db.insert(categories).values(SEED_CATEGORIES).execute();
    
    console.log('Seeding accounts...');
    await db.insert(accounts).values(SEED_ACCOUNTS).execute();
    
    console.log(`Seeding ${SEED_TRANSACTIONS.length} transactions...`);
    // Insert transactions in chunks to avoid query size limits
    const chunkSize = 500;
    for (let i = 0; i < SEED_TRANSACTIONS.length; i += chunkSize) {
      const chunk = SEED_TRANSACTIONS.slice(i, i + chunkSize);
      await db.insert(transactions).values(chunk).execute();
    }
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seed:', error);
    process.exit(1);
  }
};

main();
