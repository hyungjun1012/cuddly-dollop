import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const stocks = sqliteTable("stocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  ticker: text("ticker").notNull().default(""),
  targetWeight: real("target_weight").notNull().default(0),
  quantity: integer("quantity").notNull().default(0),
  averageCost: integer("average_cost").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const journalEntries = sqliteTable("journal_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stockId: integer("stock_id").notNull().references(() => stocks.id),
  recordedAt: text("recorded_at").notNull(),
  price: integer("price").notNull().default(0),
  roe: real("roe").notNull().default(0),
  per: real("per").notNull().default(0),
  dividendYield: real("dividend_yield").notNull().default(0),
  shortComment: text("short_comment").notNull().default(""),
  mindset: text("mindset").notNull().default(""),
  thesis: text("thesis").notNull().default(""),
  riskPlan: text("risk_plan").notNull().default(""),
  review: text("review").notNull().default(""),
  biases: text("biases").notNull().default("[]"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
