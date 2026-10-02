import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { stocks } from "@/db/schema";
import { requireApiUser } from "@/lib/api-user";

export async function GET() {
  try {
    const user = await requireApiUser(); if (user instanceof Response) return user;
    return Response.json({ stocks: await getDb().select().from(stocks).where(eq(stocks.ownerId, user.userId)).orderBy(desc(stocks.createdAt)) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "종목을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(); if (user instanceof Response) return user;
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    if (!name) return Response.json({ error: "종목명을 입력해 주세요." }, { status: 400 });
    const [stock] = await getDb().insert(stocks).values({
      ownerId: user.userId, name, ticker: String(body.ticker ?? "").trim(), targetWeight: Number(body.targetWeight) || 0,
      status: body.status === "holding" ? "holding" : "watching", memo: String(body.memo ?? "").trim(),
      market: ["KOSPI", "KOSDAQ", "OTHER"].includes(String(body.market)) ? String(body.market) : "OTHER",
      sector: String(body.sector ?? "").trim(), investmentStyle: String(body.investmentStyle ?? "other").trim(),
      currency: body.currency === "USD" ? "USD" : "KRW",
    }).returning();
    return Response.json({ stock }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "종목을 저장하지 못했습니다." }, { status: 500 });
  }
}
