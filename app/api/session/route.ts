import { eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { journalDocuments, journalEntries, portfolioSettings, stocks, userPortfolios } from "@/db/schema";

// The site was originally a private, single-owner journal. Keep that legacy
// data claimable only by its owner after the site becomes public.
const LEGACY_OWNER_EMAIL = "woosung.kwon0@gmail.com";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  try {
    const db = getDb();
    const [ownPortfolio] = await db.select().from(userPortfolios).where(eq(userPortfolios.ownerId, user.userId)).limit(1);
    const [legacyStock] = await db.select({ id: stocks.id }).from(stocks).where(eq(stocks.ownerId, "")).limit(1);
    const [legacyPortfolio] = await db.select().from(portfolioSettings).limit(1);
    let claimedLegacy = false;

    // This runs while the existing private owner opens the upgraded site, before public access is enabled.
    if (!ownPortfolio && (legacyStock || legacyPortfolio) && user.email.toLowerCase() === LEGACY_OWNER_EMAIL) {
      await db.update(stocks).set({ ownerId: user.userId }).where(eq(stocks.ownerId, ""));
      await db.update(journalEntries).set({ ownerId: user.userId }).where(eq(journalEntries.ownerId, ""));
      await db.update(journalDocuments).set({ ownerId: user.userId }).where(eq(journalDocuments.ownerId, ""));
      await db.insert(userPortfolios).values({
        ownerId: user.userId,
        cash: legacyPortfolio?.cash ?? 0,
        cashKrw: legacyPortfolio?.cashKrw ?? 0,
        cashUsd: legacyPortfolio?.cashUsd ?? 0,
        exchangeRate: legacyPortfolio?.exchangeRate ?? 1400,
        initialSetupCompleted: legacyPortfolio?.initialSetupCompleted ?? false,
      });
      claimedLegacy = true;
    }

    return Response.json({ user, claimedLegacy });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "세션을 준비하지 못했습니다." }, { status: 500 });
  }
}
