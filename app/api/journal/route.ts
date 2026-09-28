import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { journalDocuments, journalEntries, portfolioSettings, stocks } from "@/db/schema";

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "알 수 없는 오류";
  return message.includes("no such table")
    ? "일지 저장소를 준비 중입니다. 잠시 후 다시 시도해 주세요."
    : message;
}

export async function GET() {
  try {
    const db = getDb();
    const allStocks = await db.select().from(stocks).orderBy(desc(stocks.createdAt));
    const [portfolio] = await db.select().from(portfolioSettings).limit(1);
    const documents = await db.select().from(journalDocuments);
    const rows = await db.select({ entry: journalEntries, stock: stocks }).from(journalEntries)
      .innerJoin(stocks, eq(journalEntries.stockId, stocks.id))
      .orderBy(desc(journalEntries.recordedAt), desc(journalEntries.id));
    return Response.json({ portfolio: portfolio ?? { cash: 0, cashKrw: 0, cashUsd: 0, exchangeRate: 1400 }, stocks: allStocks, entries: rows.map(({ entry, stock }) => ({ ...entry, stock, documents: documents.filter(document => document.journalEntryId === entry.id) })) });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    if (!name) return Response.json({ error: "종목명을 입력해 주세요." }, { status: 400 });
    const db = getDb();
    const ticker = String(body.ticker ?? "").trim();
    const priceCurrency = body.priceCurrency === "USD" ? "USD" : "KRW";
    const [existing] = await db.select().from(stocks).where(eq(stocks.name, name)).limit(1);
    const stock = existing
      ? (await db.update(stocks).set({ ticker, currency: priceCurrency, targetWeight: Number(body.targetWeight) || existing.targetWeight, quantity: Number(body.quantity) || existing.quantity, averageCost: Number(body.averageCost) || existing.averageCost }).where(eq(stocks.id, existing.id)).returning())[0]
      : (await db.insert(stocks).values({ name, ticker, currency: priceCurrency, targetWeight: Number(body.targetWeight) || 0, quantity: Number(body.quantity) || 0, averageCost: Number(body.averageCost) || 0, status: "watching" }).returning())[0];
    const [entry] = await db.insert(journalEntries).values({
      stockId: stock.id, recordedAt: String(body.recordedAt ?? new Date().toISOString().slice(0, 10)),
      price: Number(body.price) || 0, priceCurrency, roe: Number(body.roe) || 0, per: Number(body.per) || 0,
      dividendYield: Number(body.dividendYield) || 0, shortComment: String(body.shortComment ?? "").trim(),
      mindset: String(body.mindset ?? "").trim(), thesis: String(body.thesis ?? "").trim(),
      riskPlan: String(body.riskPlan ?? "").trim(), review: String(body.review ?? "").trim(),
      biases: JSON.stringify(Array.isArray(body.biases) ? body.biases : []),
    }).returning();
    return Response.json({ entry: { ...entry, stock } }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
