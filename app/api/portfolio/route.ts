import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { portfolioSettings } from "@/db/schema";

export async function GET() {
  try {
    const [portfolio] = await getDb().select().from(portfolioSettings).limit(1);
    return Response.json({ portfolio: portfolio ?? { cash: 0 } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "포트폴리오를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { cash?: unknown };
    const db = getDb();
    const value = Math.max(0, Number(body.cash) || 0);
    const [existing] = await db.select().from(portfolioSettings).limit(1);
    const portfolio = existing
      ? (await db.update(portfolioSettings).set({ cash: value }).where(eq(portfolioSettings.id, existing.id)).returning())[0]
      : (await db.insert(portfolioSettings).values({ id: 1, cash: value }).returning())[0];
    return Response.json({ portfolio });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "현금 설정을 저장하지 못했습니다." }, { status: 500 });
  }
}
