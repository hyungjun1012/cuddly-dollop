import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { portfolioSettings } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const amount = Number(body.amount);
    const currency = body.currency === "USD" ? "USD" : "KRW";
    if (!Number.isFinite(amount) || amount <= 0) return Response.json({ error: "추가할 현금 금액을 확인해 주세요." }, { status: 400 });
    const db = getDb();
    const [portfolio] = await db.select().from(portfolioSettings).limit(1);
    if (!portfolio?.initialSetupCompleted) return Response.json({ error: "먼저 포트폴리오 초기 설정을 확정해 주세요." }, { status: 409 });
    const [updated] = await db.update(portfolioSettings).set(currency === "USD"
      ? { cashUsd: portfolio.cashUsd + amount }
      : { cash: portfolio.cashKrw + amount, cashKrw: portfolio.cashKrw + amount }).where(eq(portfolioSettings.id, portfolio.id)).returning();
    return Response.json({ portfolio: updated });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "현금을 추가하지 못했습니다." }, { status: 500 });
  }
}
