import { sqliteTable,text,integer,primaryKey } from 'drizzle-orm/sqlite-core';
export const questions=sqliteTable('questions',{id:text('id').primaryKey(),a:text('a').notNull(),b:text('b').notNull(),category:text('category').notNull()});
export const votes=sqliteTable('votes',{question:text('question').notNull(),voter:text('voter').notNull(),choice:integer('choice').notNull()},t=>[primaryKey({columns:[t.question,t.voter]})]);
export const settings=sqliteTable('settings',{id:integer('id').primaryKey(),intervalHours:integer('interval_hours').notNull()});
export const editions=sqliteTable('editions',{number:integer('number').primaryKey(),question:text('question').notNull().unique(),opensAt:integer('opens_at').notNull().unique(),closesAt:integer('closes_at').notNull()});
