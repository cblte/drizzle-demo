// File: index.ts
//
// Drizzle ORM Demo Script
// This script demonstrates the usage of Drizzle ORM with a PostgreSQL database.
// It includes examples of CRUD operations, transactions, and advanced queries.
//
// ⚠️ WARNING: This script performs destructive operations (e.g., deleting users).
// Ensure you are running this in a safe environment (e.g., development or testing).
//
// Author: Carsten
// Date: April 19, 2025

// Import the drizzle ORM for PostgreSQL and schema definitions
import { drizzle } from 'drizzle-orm/node-postgres';
import { categories, users, tasks } from './drizzle/schema';
import { and, eq, gt, like, lt, or, desc } from 'drizzle-orm'; // Import query operators for building conditions
import inquirer from 'inquirer'; // Import inquirer for user prompts

// Initialize the database connection using the POSTGRES_URL environment variable
const db = drizzle(process.env.POSTGRES_URL!);

// Utility function to pause and inform the user about the next step
async function pause(nextStep: string) {
  await inquirer.prompt([
    {
      type: 'input',
      name: 'pause',
      message: `Press Enter to continue to the next step: ${nextStep}`,
    },
  ]);
}

// Drizzle ORM Demo Script
// This script demonstrates the usage of Drizzle ORM with a PostgreSQL database.
// It includes examples of CRUD operations, transactions, and advanced queries.

console.log('🌟 Welcome to the Drizzle ORM Demo Script!');
console.log('This script will demonstrate various database operations step-by-step.\n');
await pause('Deleting all users from the database');

// ⚠️ WARNING: Deleting all users from the database
console.log('Step 1: Deleting all users from the database...');
const removeUsers = await db.delete(users);
console.log('✅ All users have been deleted.\n');
await pause('Inserting multiple users into the database');

// Step 2: Insert multiple users into the database
console.log('Step 2: Inserting multiple users into the database...');
const user = await db
  .insert(users)
  .values([
    { email: 'johndoe@example.com', username: 'johndoe', age: 30 },
    { email: 'janedoe@example.com', username: 'janedoe', age: 25 },
    { email: 'alice@example.com', username: 'alice', age: 45 },
    { email: 'bob@example.com', username: 'bob', age: 60 },
    { email: 'charlie@example.com', username: 'charlie', age: 47 },
    { email: 'dave@example.com', username: 'dave', age: 16 },
    { email: 'eve@example.com', username: 'eve', age: 15 },
  ])
  .returning();
console.log('✅ Users have been inserted:', user, '\n');
await pause('Fetching all users currently in the database');

// Step 3: Fetch all users currently in the database
console.log('Step 3: Fetching all users currently in the database...');
const users_in_db = await db.select().from(users);
console.log('✅ Users in the database:', users_in_db, '\n');
await pause('Querying a specific user by email');

// Step 4: Query a specific user by email
console.log('Step 4: Querying for a specific user by email (bob@example.com)...');
const user_johndoe = await db.select().from(users).where(eq(users.email, 'bob@example.com'));
console.log('✅ Queried User:', user_johndoe[0], '\n');
await pause('Updating Charlie’s username and email');

// Step 5: Update a user’s information
console.log('Step 5: Updating Charlie’s username and email...');
const updatedUser = await db
  .update(users)
  .set({ username: 'Steven', email: 'steven@example.com' })
  .where(eq(users.email, 'charlie@example.com'))
  .returning();
console.log('✅ Updated User:', updatedUser, '\n');
await pause('Deleting Bob from the database');

// Step 6: Delete a user by email
console.log('Step 6: Deleting Bob from the database...');
const deletedUser = await db.delete(users).where(eq(users.email, 'bob@example.com')).returning();
console.log('✅ Deleted User:', deletedUser, '\n');
await pause('Fetching all users after deletion');

// Step 7: Display all users after deletion
console.log('Step 7: Fetching all users after deletion...');
const usersAfterDelete = await db.select().from(users);
console.log('✅ Users in the database after deletion:', usersAfterDelete, '\n');
await pause('Demonstrating a transaction');

// Step 8: Execute a transaction
console.log('Step 8: Demonstrating a transaction...');
const transactionResult = await db.transaction(async (tx) => {
  console.log('  - Inserting a new user inside the transaction...');
  const newUser = await tx
    .insert(users)
    .values({ email: 'transaction@example.com', username: 'Transaction User' })
    .returning();
  console.log('  ✅ New User in Transaction:', newUser);

  console.log('  - Updating the newly inserted user within the same transaction...');
  const updatedUser = await tx
    .update(users)
    .set({ username: 'Updated Transaction User' })
    .where(eq(users.email, 'transaction@example.com'))
    .returning();
  console.log('  ✅ Updated User in Transaction:', updatedUser);

  return updatedUser;
});
console.log('✅ Transaction completed successfully:', transactionResult, '\n');
await pause('Fetching all users after the transaction');

// Step 9: Verify state of users after transaction
console.log('Step 9: Fetching all users after the transaction...');
const usersAfterTransaction = await db.select().from(users);
console.log('✅ Users in the database after transaction:', usersAfterTransaction, '\n');
await pause('Updating Eve’s age to 25');

// Step 10: Update Eve’s age
console.log('Step 10: Updating Eve’s age to 25...');
const updatedEve = await db.update(users).set({ age: 25 }).where(eq(users.username, 'eve')).returning();
console.log('✅ Updated Eve:', updatedEve, '\n');
await pause('Querying for Eve with age between 18 and 30');

// Step 11: Query for Eve with age between 18 and 30
console.log('Step 11: Querying for Eve with age between 18 and 30...');
const sortedUserList = await db
  .select()
  .from(users)
  .where(and(like(users.username, '%eve%'), and(gt(users.age, 18), lt(users.age, 30))));
console.log('✅ Sorted User List:', sortedUserList, '\n');
await pause('Ordering users by age in descending order');

// Step 12: Order users by age in descending order
console.log('Step 12: Ordering users by age in descending order...');
const orderedUsers = await db.select().from(users).orderBy(desc(users.age));
console.log('✅ Ordered Users:', orderedUsers, '\n');
await pause('Paginating users');

// Step 13: Paginate users

// Before demonstrating pagination, add more random users to the database
console.log('Step 13a: Adding more random users for pagination demonstration...');
await db.transaction(async (tx) => {
  for (let i = 1; i <= 20; i++) {
    await tx.insert(users).values({
      email: `random${i}@example.com`,
      username: `randomUser${i}`,
      age: Math.floor(Math.random() * 50) + 15,
    });
  }
});

console.log('Step 13b: Paginating users...');
const pageSize = 4;
const currentPage = 2;

const paginatedUsers = await db
  .select()
  .from(users)
  .orderBy(desc(users.age))
  .limit(pageSize)
  .offset((currentPage - 1) * pageSize);
console.log('✅ Paginated Users:', '\n');
console.table(paginatedUsers);
await pause('Completing the demonstration');

console.log('🎉 Demonstration complete! Thank you for exploring Drizzle ORM with this script.');
