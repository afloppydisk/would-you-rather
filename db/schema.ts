import { sqliteTable,text,integer,primaryKey } from 'drizzle-orm/sqlite-core';
export const questions=sqliteTable('questions',{id:text('id').primaryKey(),a:text('a').notNull(),b:text('b').notNull(),category:text('category').notNull()});
export const votes=sqliteTable('votes',{question:text('question').notNull(),voter:text('voter').notNull(),choice:integer('choice').notNull()},t=>[primaryKey({columns:[t.question,t.voter]})]);
