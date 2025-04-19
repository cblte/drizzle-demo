# 🌩️ drizzle-demo

Welcome to **drizzle-demo**, a project born from exploring the depths of modern JavaScript and TypeScript development. This repository is a playground for learning, experimenting, and mastering database operations with [Drizzle ORM](https://orm.drizzle.team/) and [Bun](https://bun.sh).

## 🚀 What is drizzle-demo?

This project is a combination of:

- **Course Examples**: The `index.ts` file is a collection of examples and exercises from course material, stacked together as you progressed through the lessons.
- **User Management CLI**: The `usermanager.ts` file is a (fully) functional CLI tool for managing users in a PostgreSQL database.

Whether you're here to review course material or explore a practical implementation of database operations, this project has something for you.

## 📂 Project Structure

### `index.ts`

This file is a sandbox of course examples. As you followed along with the course material, you added examples here to test and experiment with concepts. It’s a great place to revisit and reinforce what you’ve learned.

### `usermanager.ts`

This file is where the magic happens. It’s a robust CLI tool for managing users in a PostgreSQL database. Features include:

- **View Users**: Display all users in a clean, tabular format.
- **Add Users**: Create new users with prompts for email, username, and age.
- **Update Users**: Modify existing user details with pre-filled prompts for convenience.
- **Delete Users**: Remove users from the database with a simple ID-based selection.
- **Search Users**: Find users by name and age range using flexible query options.

The `usermanager.ts` file is a practical demonstration of how to build a real-world application using Drizzle ORM and TypeScript.

## 🛠️ Installation

To install dependencies, run:

```bash
bun install
```

## ▶️ Running the Project

To start the CLI tool or experiment with course examples, execute:

```bash
bun run index.ts
```

## 🧙 About the Tech Stack

- **[Bun](https://bun.sh)**: A fast, all-in-one JavaScript runtime that simplifies development.
- **[Drizzle ORM](https://orm.drizzle.team/)**: A type-safe, lightweight ORM for modern TypeScript projects.
- **TypeScript**: Ensures type safety and better developer experience.
- **PostgreSQL**: A powerful, open-source database for scalable data storage.

## 🧑‍💻 Why drizzle-demo?

This project is perfect for:

- Revisiting course material and examples (`index.ts`).
- Learning how to structure a TypeScript project.
- Exploring Drizzle ORM for database operations.
- Building interactive CLI tools with prompts.

## 📜 License

This project is licensed under the MIT License. Feel free to use, modify, and share it as you like!

---

Happy coding! 🚀
