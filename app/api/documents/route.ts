import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { journalDocuments, journalEntries } from "@/db/schema";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const journalEntryId = Number(form.get("journalEntryId"));
    const file = form.get("file");
    if (!journalEntryId || !(file instanceof File)) return Response.json({ error: "기록과 첨부 파일을 확인해 주세요." }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return Response.json({ error: "첨부 파일은 15MB 이하만 저장할 수 있습니다." }, { status: 400 });
    const [entry] = await getDb().select().from(journalEntries).where(eq(journalEntries.id, journalEntryId)).limit(1);
    if (!entry) return Response.json({ error: "기록을 찾을 수 없습니다." }, { status: 404 });
    if (!env.FILES) return Response.json({ error: "문서 저장소를 준비 중입니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "document";
    const objectKey = `journal/${journalEntryId}/${crypto.randomUUID()}-${safeName}`;
    await env.FILES.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" } });
    const [document] = await getDb().insert(journalDocuments).values({
      journalEntryId, objectKey, fileName: file.name || "document", contentType: file.type || "application/octet-stream", size: file.size,
    }).returning();
    return Response.json({ document }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "문서를 저장하지 못했습니다." }, { status: 500 });
  }
}
