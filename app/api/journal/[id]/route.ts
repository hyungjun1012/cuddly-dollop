import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { journalEntries } from "@/db/schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const [entry] = await getDb().update(journalEntries).set({
      recordedAt: String(body.recordedAt ?? ""),
      price: Number(body.price) || 0,
      priceCurrency: body.priceCurrency === "USD" ? "USD" : "KRW",
      roe: Number(body.roe) || 0,
      per: Number(body.per) || 0,
      dividendYield: Number(body.dividendYield) || 0,
      shortComment: String(body.shortComment ?? "").trim(),
      mindset: String(body.mindset ?? "").trim(),
      thesis: String(body.thesis ?? "").trim(),
      riskPlan: String(body.riskPlan ?? "").trim(),
      review: String(body.review ?? "").trim(),
      biases: JSON.stringify(Array.isArray(body.biases) ? body.biases : []),
    }).where(eq(journalEntries.id, Number(id))).returning();
    if (!entry) return Response.json({ error: "기록을 찾을 수 없습니다." }, { status: 404 });
    return Response.json({ entry });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "기록을 수정하지 못했습니다." }, { status: 500 });
  }
}
