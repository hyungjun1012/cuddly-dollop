import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { journalEntries, portfolioSettings, stocks } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const stockId = Number(body.stockId);
    const side = body.side === "sell" ? "sell" : "buy";
    const quantity = Math.floor(Number(body.quantity));
    const price = Number(body.price);
    if (!stockId || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) {
      return Response.json({ error: "매매 수량과 체결가를 확인해 주세요." }, { status: 400 });
    }

    const db = getDb();
    const [portfolio] = await db.select().from(portfolioSettings).limit(1);
    if (!portfolio?.initialSetupCompleted) return Response.json({ error: "먼저 포트폴리오 초기 설정을 확정해 주세요." }, { status: 409 });
    const [stock] = await db.select().from(stocks).where(eq(stocks.id, stockId)).limit(1);
    if (!stock) return Response.json({ error: "종목을 찾을 수 없습니다." }, { status: 404 });
    if (side === "sell" && quantity > stock.quantity) {
      return Response.json({ error: `보유 수량(${stock.quantity}주)보다 많이 매도할 수 없습니다.` }, { status: 400 });
    }
    const currency = body.priceCurrency === "USD" ? "USD" : "KRW";
    const amount = price * quantity;
    const availableCash = currency === "USD" ? portfolio.cashUsd : portfolio.cashKrw;
    if (side === "buy" && amount > availableCash) return Response.json({ error: `${currency} 투자 대기 현금이 부족합니다. 초기 설정 금액을 확인해 주세요.` }, { status: 400 });

    const nextQuantity = side === "buy" ? stock.quantity + quantity : stock.quantity - quantity;
    const nextAverageCost = side === "buy"
      ? ((stock.averageCost * stock.quantity) + (price * quantity)) / nextQuantity
      : (nextQuantity ? stock.averageCost : 0);
    const [updatedStock] = await db.update(stocks).set({
      quantity: nextQuantity,
      averageCost: nextAverageCost,
      status: nextQuantity > 0 ? "holding" : "watching",
      currency,
    }).where(eq(stocks.id, stock.id)).returning();
    const nextCash = side === "buy" ? availableCash - amount : availableCash + amount;
    await db.update(portfolioSettings).set(currency === "USD"
      ? { cashUsd: nextCash }
      : { cash: nextCash, cashKrw: nextCash }).where(eq(portfolioSettings.id, portfolio.id));

    const previous = await db.select({ id: journalEntries.id }).from(journalEntries).where(eq(journalEntries.stockId, stock.id)).limit(1);
    const [entry] = await db.insert(journalEntries).values({
      stockId: stock.id,
      recordType: previous.length ? "update" : "initial",
      entryKind: "trade",
      tradeSide: side,
      tradeQuantity: quantity,
      tradePrice: price,
      recordedAt: String(body.recordedAt ?? new Date().toISOString().slice(0, 10)),
      price,
      priceCurrency: currency,
      shortComment: String(body.shortComment ?? `${side === "buy" ? "매수" : "매도"} 기록`).trim(),
      mindset: String(body.mindset ?? "").trim(),
      thesis: String(body.thesis ?? "").trim(),
      riskPlan: String(body.riskPlan ?? "").trim(),
      biases: "[]",
    }).returning();
    return Response.json({ entry: { ...entry, stock: updatedStock } }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "매매 기록을 저장하지 못했습니다." }, { status: 500 });
  }
}
