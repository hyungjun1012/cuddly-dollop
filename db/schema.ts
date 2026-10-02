import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const stocks = sqliteTable("stocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").notNull().default(""),
  name: text("name").notNull(),
  ticker: text("ticker").notNull().default(""),
  targetWeight: real("target_weight").notNull().default(0),
  quantity: integer("quantity").notNull().default(0),
  averageCost: integer("average_cost").notNull().default(0),
  initialQuantity: integer("initial_quantity").notNull().default(0),
  initialAverageCost: real("initial_average_cost").notNull().default(0),
  status: text("status").notNull().default("watching"),
  memo: text("memo").notNull().default(""),
  market: text("market").notNull().default("OTHER"),
  sector: text("sector").notNull().default(""),
  investmentStyle: text("investment_style").notNull().default("other"),
  currency: text("currency").notNull().default("KRW"),
  holdingStartedAt: text("holding_started_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_stocks_owner_created").on(table.ownerId, table.createdAt)]);

export const userPortfolios = sqliteTable("user_portfolios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").notNull(),
  cash: integer("cash").notNull().default(0),
  cashKrw: integer("cash_krw").notNull().default(0),
  cashUsd: integer("cash_usd").notNull().default(0),
  exchangeRate: real("exchange_rate").notNull().default(1400),
  initialSetupCompleted: integer("initial_setup_completed", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("user_portfolios_owner_id_unique").on(table.ownerId)]);

export const portfolioSettings = sqliteTable("portfolio_settings", {
  id: integer("id").primaryKey(),
  cash: integer("cash").notNull().default(0),
  cashKrw: integer("cash_krw").notNull().default(0),
  cashUsd: integer("cash_usd").notNull().default(0),
  exchangeRate: real("exchange_rate").notNull().default(1400),
  initialSetupCompleted: integer("initial_setup_completed", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const journalEntries = sqliteTable("journal_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").notNull().default(""),
  stockId: integer("stock_id").notNull().references(() => stocks.id),
  recordType: text("record_type").notNull().default("update"),
  entryKind: text("entry_kind").notNull().default("journal"),
  tradeSide: text("trade_side").notNull().default(""),
  tradeQuantity: integer("trade_quantity").notNull().default(0),
  tradePrice: real("trade_price").notNull().default(0),
  holdingDays: integer("holding_days").notNull().default(0),
  recordedAt: text("recorded_at").notNull(),
  price: integer("price").notNull().default(0),
  priceCurrency: text("price_currency").notNull().default("KRW"),
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
}, (table) => [index("idx_journal_entries_owner_recorded").on(table.ownerId, table.recordedAt)]);

export const journalDocuments = sqliteTable("journal_documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").notNull().default(""),
  journalEntryId: integer("journal_entry_id").notNull().references(() => journalEntries.id),
  objectKey: text("object_key").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull().default("application/octet-stream"),
  size: integer("size").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_journal_documents_owner_entry").on(table.ownerId, table.journalEntryId)]);
