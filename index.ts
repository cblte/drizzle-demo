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
import { and, eq, gt, like, lt, or } from 'drizzle-orm'; // Import query operators for building conditions

// Initialize the database connection using the POSTGRES_URL from environment variables
// Ensure that the POSTGRES_URL environment variable is set before running this code
const db = drizzle(process.env.POSTGRES_URL!);

// ⚠️ WARNING: This deletes all users from the database
// Use this operation with extreme caution, especially in production environments
const removeUsers = await db.delete(users);

// Insert multiple users into the database
// The `.values()` method specifies the records to insert
// The `.returning()` method fetches the inserted records after the operation
const user = await db
  .insert(users)
  .values([
    { email: 'johndoe@example.com', username: 'johndoe' }, // First user
    { email: 'test@example.com', username: 'test user' }, // Second user
  ])
  .returning();

console.log(user); // Log the inserted users to the console

// Fetch all users currently in the database
// The `.select()` method retrieves data from the specified table
const users_in_db = await db.select().from(users);
console.log('\n\n----------');
console.log('Users in DB:', users_in_db); // Log all users in the database

// Query a specific user by email
// The `.where()` method filters records based on the specified condition
console.log('Querying for a single user');
const user_johndoe = await db.select().from(users).where(eq(users.email, 'johndoe@example.com'));
console.log(user_johndoe[0]); // Log the first matching user (if any)

// Update a user's information based on their email
// The `.update()` method modifies records in the specified table
// The `.set()` method specifies the new values for the fields
const updatedUser = await db
  .update(users)
  .set({ username: 'Sarah', email: 'sarah@example.com' }) // Update username and email
  .where(eq(users.email, 'test@example.com')) // Filter by email
  .returning(); // Return the updated record
console.log('Updated User:\n', updatedUser);

// Delete a user and return the deleted record
// The `.delete()` method removes records from the specified table
const deletedUser = await db.delete(users).where(eq(users.email, 'johndoe@example.com')).returning();
console.log('Deleted User:\n', deletedUser);

// Display all users after deletion
const usersAfterDelete = await db.select().from(users);
console.log('Users in DB after delete:\n', usersAfterDelete);

// Execute a transaction: insert, update, and optionally rollback
// Transactions allow multiple operations to be executed atomically
const transactionResult = await db.transaction(async (tx) => {
  // Insert a new user inside the transaction
  const newUser = await tx
    .insert(users)
    .values({ email: 'transaction@example.com', username: 'Transaction User' })
    .returning();
  console.log('New User in Transaction:', newUser);

  // Update the newly inserted user within the same transaction
  const updatedUser = await tx
    .update(users)
    .set({ username: 'Updated Transaction User' })
    .where(eq(users.email, 'transaction@example.com'))
    .returning();
  console.log('Updated User in Transaction:', updatedUser);

  // Optional rollback (useful for testing transactions)
  // Uncomment the line below to simulate a rollback
  // throw new Error('Simulating a rollback');

  return updatedUser; // Return the result of the transaction
});
console.log('Transaction Result:', transactionResult);

// Verify state of users after transaction
const usersAfterTransaction = await db.select().from(users);
console.log('Users in DB after transaction:\n', usersAfterTransaction);

// Select tasks along with category information (if available)
// The `.leftJoin()` method performs a LEFT JOIN between two tables
const tasksWithCategories = await db
  .select({
    taskId: tasks.id, // Task ID
    taskName: tasks.title, // Task title
    taskCreatedAt: tasks.createdAt, // Task creation timestamp
    taskDonge: tasks.done, // Typo: should likely be 'taskDone'
  })
  .from(tasks)
  .leftJoin(categories, eq(tasks.categoryId, categories.id)); // Join tasks with categories

// Fetch tasks with associated category names
const taskWithCategories = await db
  .select({
    taskId: tasks.id, // Task ID
    taskName: tasks.title, // Task title
    categoryName: categories.name, // Category name
    taskDone: tasks.done, // Task completion status
  })
  .from(tasks)
  .leftJoin(categories, eq(tasks.categoryId, categories.id)); // Join tasks with categories

console.log('Tasks with Categories:', tasksWithCategories);

// Update Sarah’s age to 25
// Adds a new field `age` to the user record if it doesn't already exist
console.log('Updating Sarah to be age of 25');
const updatedSarah = await db.update(users).set({ age: 25 }).where(eq(users.username, 'Sarah')).returning();
console.log('Updated Sarah:', updatedSarah);

// Search for a user named Sarah with age between 18 and 30
// Combines multiple conditions using `and()` and `like()` operators
console.log('Querying for a Sarah user with age between 18 and 30');
const sortedUserList = await db
  .select()
  .from(users)
  .where(and(like(users.username, '%Sarah%'), and(gt(users.age, 18), lt(users.age, 30))));
console.log('Sorted User List:', sortedUserList);
