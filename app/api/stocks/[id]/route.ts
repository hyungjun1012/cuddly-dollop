import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { stocks } from "@/db/schema";
import { requireApiUser } from "@/lib/api-user";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireApiUser(); if (user instanceof Response) return user;
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    if (!name) return Response.json({ error: "종목명을 입력해 주세요." }, { status: 400 });
    const hasHoldingFields = Object.hasOwn(body, "quantity") || Object.hasOwn(body, "averageCost");
    const hasInitialPositionFields = body.initialPosition === true || Object.hasOwn(body, "initialQuantity") || Object.hasOwn(body, "initialAverageCost");
    const update = {
      name, ticker: String(body.ticker ?? "").trim(), targetWeight: Number(body.targetWeight) || 0,
      status: body.status === "holding" ? "holding" : "watching", memo: String(body.memo ?? "").trim(),
      market: ["KOSPI", "KOSDAQ", "OTHER"].includes(String(body.market)) ? String(body.market) : "OTHER",
      sector: String(body.sector ?? "").trim(), investmentStyle: String(body.investmentStyle ?? "other").trim(),
      currency: body.currency === "USD" ? "USD" : "KRW",
      ...(hasHoldingFields ? { quantity: Number(body.quantity) || 0, averageCost: Number(body.averageCost) || 0, holdingStartedAt: Number(body.quantity) > 0 ? String(body.holdingStartedAt ?? new Date().toISOString().slice(0, 10)) : null } : {}),
      ...(hasInitialPositionFields ? { initialQuantity: Number(body.initialQuantity ?? body.quantity) || 0, initialAverageCost: Number(body.initialAverageCost ?? body.averageCost) || 0 } : {}),
    };
    const [stock] = await getDb().update(stocks).set(update).where(and(eq(stocks.id, Number(id)), eq(stocks.ownerId, user.userId))).returning();
    if (!stock) return Response.json({ error: "종목을 찾을 수 없습니다." }, { status: 404 });
    return Response.json({ stock });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "수정에 실패했습니다." }, { status: 500 });
  }
}
