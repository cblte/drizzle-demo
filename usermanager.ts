// User Manager CLI Tool
//
// This script provides a command-line interface (CLI) for managing users in a PostgreSQL
// database using Drizzle ORM. It allows you to perform CRUD operations, search for users
// by name and age range, and interact with the database in an intuitive way.
//
// Features:
// - View all users
// - Add a new user
// - Update an existing user
// - Delete a user
// - Search for users by name and age range
//
// WARNING: This script performs database operations. Ensure you are running it in a
// safe environment (e.g., development or testing).
//
// Author: Carsten
// Date: April 19, 2025
//

import inquirer from 'inquirer'; // For interactive CLI prompts
import { input, number } from '@inquirer/prompts'; // Custom input and number prompts
import { drizzle } from 'drizzle-orm/node-postgres'; // Drizzle ORM for PostgreSQL
import { users } from './drizzle/schema'; // Import the users table schema
import { eq, and, gt, lt, like, gte, lte } from 'drizzle-orm'; // Query operators for building conditions
import validator from 'validator'; // For input validation

// Initialize the database connection using the POSTGRES_URL environment variable
const db = drizzle(process.env.POSTGRES_URL!);

interface User {
  id: number;
  email: string;
  username: string;
  age: number | null;
}

// Utility function: Pause the program and wait for the user to press Enter
// This is used to give the user time to review output before returning to the menu
async function pause() {
  await inquirer.prompt([
    {
      type: 'input',
      name: 'pause',
      message: 'Press Enter to continue...', // Prompt message
    },
  ]);
  console.clear(); // Clear the console after the pause
}

// Main menu function: Displays the menu and handles user actions
async function mainMenu() {
  while (true) {
    console.clear(); // Clear the console at the start of each menu loop

    // Prompt the user to select an action from the menu
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?', // Menu title
        choices: [
          { name: '👀 View all users', value: 'view' }, // View all users
          { name: '➕ Add a user', value: 'add' }, // Add a new user
          { name: '🛠️ Update a user', value: 'update' }, // Update an existing user
          { name: '🗑️ Remove a user', value: 'delete' }, // Delete a user
          { name: '🔎 Find users by name & age', value: 'search' }, // Search for users
          new inquirer.Separator(), // Separator for better menu organization
          { name: '🚪 Exit', value: 'exit' }, // Exit the program
        ],
      },
    ]);

    // Handle the selected action
    switch (action) {
      case 'view':
        await viewAllUsers(); // View all users
        break;
      case 'add':
        await addUser(); // Add a new user
        break;
      case 'update':
        await updateUser(); // Update an existing user
        break;
      case 'delete':
        await deleteUser(); // Delete a user
        break;
      case 'search':
        await searchUser(); // Search for users
        break;
      case 'exit':
        console.clear();
        console.log('\nGoodbye!'); // Exit message
        process.exit(0); // Exit the program
    }

    await pause(); // Pause before returning to the menu
  }
}

// Function: View all users in the database
// This function fetches all users from the database and displays them in a table format.
async function viewAllUsers() {
  const allUsers = await db.select().from(users); // Fetch all users from the database
  console.log('\n📋 Current Users:\n'); // Display header
  console.table(allUsers); // Display users in a table format
}

// Function: Add a new user to the database
// This function prompts the user for email, username, and age, validates the inputs,
// and inserts the new user into the database.
async function addUser() {
  const email = await input({
    message: 'Email:', // Prompt for email
    validate: (input) => validator.isEmail(input) || 'Enter a valid email', // Validate email
  });

  const username = await input({
    message: 'Username:', // Prompt for username
    validate: (input) => validator.isAscii(input) || 'Enter a valid username', // Validate username
  });

  const age = await number({
    message: 'Age (optional):', // Prompt for age
    default: 0, // Default age is 0
    validate: (input) => validator.isInt((input ?? '').toString()) || 'Enter a valid age', // Validate age
  });

  // Insert the new user into the database
  const result = await db.insert(users).values({ email, username, age }).returning();

  console.log('\n✅ User created:'); // Success message
  console.table(result); // Display the created user
}

// Function: Update an existing user's details
// This function allows the user to update a user's details by providing the user ID
// and new values for username, email, and age.
async function updateUser() {
  await viewAllUsers(); // Display all users for reference to help the user select an ID

  // Prompt the user to enter the ID of the user to update
  const id = (await number({
    message: 'ID of user to update:', // Prompt for user ID
    validate: (input) =>
      (input !== undefined && validator.isInt(input.toString(), { min: 1 })) || 'Enter a valid numeric ID', // Validate ID
  })) as number;

  // Fetch the selected user from the database
  const target: User[] = await db.select().from(users).where(eq(users.id, id));

  // Check if the user exists
  if (target.length === 0) {
    console.log('\n⚠️ No user found with that ID.'); // Error message if no user found
    return;
  }

  const foundUser = target[0]; // Get the first user from the result
  // But we still need to check if the user exists aka is undefined
  if (foundUser === undefined) {
    console.log('\n⚠️ No user found with that ID.'); // Error message if no user found
    return;
  }

  // Prompt the user to enter a new username, pre-filled with the current username
  const username = await input({
    message: 'New username:', // Prompt for new username
    default: foundUser.username || '', // Pre-fill with current username or use an empty string
  });

  // Prompt the user to enter a new email, pre-filled with the current email
  const newEmail = await input({
    message: 'New email (optional):', // Prompt for new email
    default: foundUser.email || '', // Pre-fill with current email
  });

  // Prompt the user to enter a new age, pre-filled with the current age
  const age = (await number({
    message: 'New age (optional):', // Prompt for new age
    default: foundUser.age || 0, // Pre-fill with current age
    validate: (input) => validator.isInt((input ?? '').toString()) || 'Enter a valid age', // Validate age
  })) as number;

  // Build the update payload with the new values
  const updatePayload: any = { username };
  if (newEmail) updatePayload.email = newEmail; // Add email to the payload if provided
  if (age !== undefined) updatePayload.age = age; // Add age to the payload if provided

  // Update the user in the database
  const result = await db.update(users).set(updatePayload).where(eq(users.id, id)).returning();

  // Check if the update was successful
  if (result.length > 0) {
    console.log('\n✏️ Updated user:'); // Success message
    console.table(result); // Display the updated user details
  } else {
    console.log('\n⚠️ No user found with that ID.'); // Error message if update fails
  }
}

// Function: Delete a user from the database
// This function allows the user to delete a user by providing the user ID.
async function deleteUser() {
  await viewAllUsers(); // Display all users for reference to help the user select an ID

  // Prompt the user to enter the ID of the user to delete
  const id = await number({
    message: 'ID of user to delete:', // Prompt for user ID
    validate: (input) => validator.isInt((input ?? '').toString(), { min: 1 }) || 'Enter a valid numeric ID', // Validate ID
  });

  // Check if the ID is undefined (e.g., if the user cancels the input)
  if (id === undefined) {
    console.log('\n⚠️ Invalid ID provided.'); // Error message for undefined ID
    return; // Exit the function early
  }

  // Attempt to delete the user from the database
  const result = await db.delete(users).where(eq(users.id, id)).returning();

  // Check if the deletion was successful
  if (result.length > 0) {
    console.log('\n🗑️ User deleted:'); // Success message
    console.table(result); // Display the deleted user details
  } else {
    console.log('\n⚠️ No user found with that ID.'); // Error message if no user was found with the given ID
  }
}

// Function: Search for users by name and age range
// This function allows the user to search for users by providing a partial or full username
// and specifying a minimum and maximum age range.
async function searchUser() {
  // Prompt the user to enter a username (partial or full) for the search
  const username = await input({
    message: 'Benutzername (Teil oder vollständig):', // Prompt for username
  });

  // Prompt the user to enter the minimum age for the search
  const minAge = (await number({
    message: 'Mindestalter:', // Prompt for minimum age
    default: 0, // Default minimum age is 0
    validate: (value) => (value !== undefined && value >= 0 ? true : 'Bitte geben Sie eine gültige Zahl ein.'), // Validate minimum age
  })) as number;

  // Prompt the user to enter the maximum age for the search
  const maxAge = (await number({
    message: 'Höchstalter:', // Prompt for maximum age
    default: 100, // Default maximum age is 100
    validate: (value) =>
      value !== undefined && value >= minAge ? true : 'Höchstalter muss größer oder gleich dem Mindestalter sein.', // Validate maximum age
  })) as number;

  // Query the database for users matching the criteria
  const results = await db
    .select()
    .from(users)
    .where(and(like(users.username, `%${username}%`), and(gte(users.age, minAge), lte(users.age, maxAge))));

  // Display the search results
  console.log('\n🔍 Suchergebnisse:\n'); // Header for search results
  if (results.length === 0) {
    console.log('Keine Benutzer gefunden.'); // Message if no users were found
    return;
  } else {
    console.table(results); // Display the found users in a table format
  }
}

// Run the program
await mainMenu(); // Start the main menu
