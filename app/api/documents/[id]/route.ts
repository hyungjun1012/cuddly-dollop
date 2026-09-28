import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { journalDocuments } from "@/db/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [document] = await getDb().select().from(journalDocuments).where(eq(journalDocuments.id, Number(id))).limit(1);
    if (!document || !env.FILES) return Response.json({ error: "문서를 찾을 수 없습니다." }, { status: 404 });
    const object = await env.FILES.get(document.objectKey);
    if (!object) return Response.json({ error: "문서를 찾을 수 없습니다." }, { status: 404 });
    return new Response(object.body, { headers: { "Content-Type": document.contentType, "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(document.fileName)}` } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "문서를 열지 못했습니다." }, { status: 500 });
  }
}
