import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { stocks } from "@/db/schema";

export async function GET() {
  try {
    return Response.json({ stocks: await getDb().select().from(stocks).orderBy(desc(stocks.createdAt)) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "종목을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    if (!name) return Response.json({ error: "종목명을 입력해 주세요." }, { status: 400 });
    const [stock] = await getDb().insert(stocks).values({
      name, ticker: String(body.ticker ?? "").trim(), targetWeight: Number(body.targetWeight) || 0,
      status: body.status === "holding" ? "holding" : "watching", memo: String(body.memo ?? "").trim(),
    }).returning();
    return Response.json({ stock }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "종목을 저장하지 못했습니다." }, { status: 500 });
  }
}
