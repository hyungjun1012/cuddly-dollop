import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { userPortfolios } from "@/db/schema";
import { requireApiUser } from "@/lib/api-user";

export async function GET() {
  try {
    const user = await requireApiUser(); if (user instanceof Response) return user;
    const [portfolio] = await getDb().select().from(userPortfolios).where(eq(userPortfolios.ownerId, user.userId)).limit(1);
    return Response.json({ portfolio: portfolio ?? { cash: 0, cashKrw: 0, cashUsd: 0, exchangeRate: 1400, initialSetupCompleted: false } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "포트폴리오를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireApiUser(); if (user instanceof Response) return user;
    const body = (await request.json()) as { cashKrw?: unknown; cashUsd?: unknown; exchangeRate?: unknown };
    const db = getDb();
    const cashKrw = Math.max(0, Number(body.cashKrw) || 0);
    const cashUsd = Math.max(0, Number(body.cashUsd) || 0);
    const exchangeRate = Math.max(0, Number(body.exchangeRate) || 1400);
    const [existing] = await db.select().from(userPortfolios).where(eq(userPortfolios.ownerId, user.userId)).limit(1);
    if (existing?.initialSetupCompleted) return Response.json({ error: "초기 포트폴리오는 이미 확정되었습니다. 이후 수량과 현금은 매매 기록에서 변경해 주세요." }, { status: 409 });
    const portfolio = existing
      ? (await db.update(userPortfolios).set({ cash: cashKrw, cashKrw, cashUsd, exchangeRate, initialSetupCompleted: true }).where(eq(userPortfolios.id, existing.id)).returning())[0]
      : (await db.insert(userPortfolios).values({ ownerId: user.userId, cash: cashKrw, cashKrw, cashUsd, exchangeRate, initialSetupCompleted: true }).returning())[0];
    return Response.json({ portfolio });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "현금 설정을 저장하지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser(); if (user instanceof Response) return user;
    const body = (await request.json()) as { exchangeRate?: unknown };
    const exchangeRate = Math.max(0, Number(body.exchangeRate) || 0);
    if (!exchangeRate) return Response.json({ error: "환율을 확인해 주세요." }, { status: 400 });
    const db = getDb();
    const [portfolio] = await db.select().from(userPortfolios).where(eq(userPortfolios.ownerId, user.userId)).limit(1);
    if (!portfolio?.initialSetupCompleted) return Response.json({ error: "먼저 포트폴리오 초기 설정을 확정해 주세요." }, { status: 409 });
    const [updated] = await db.update(userPortfolios).set({ exchangeRate }).where(eq(userPortfolios.id, portfolio.id)).returning();
    return Response.json({ portfolio: updated });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "환율을 변경하지 못했습니다." }, { status: 500 });
  }
}
