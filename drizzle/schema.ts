import { pgTable, unique, serial, varchar, foreignKey, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const categories = pgTable(
  'categories',
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
  },
  (table) => [unique('categories_name_key').on(table.name)]
);

export const tasks = pgTable(
  'tasks',
  {
    id: serial().primaryKey().notNull(),
    title: text().notNull(),
    done: boolean().default(false),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    categoryId: integer('category_id'),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'tasks_category_id_fkey',
    }).onDelete('set null'),
  ]
);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: text('email').notNull().unique(),
  age: integer('age').default(0),
});
