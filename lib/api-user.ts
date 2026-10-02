import { getChatGPTUser, type ChatGPTUser } from "@/app/chatgpt-auth";

export async function requireApiUser(): Promise<ChatGPTUser | Response> {
  const user = await getChatGPTUser();
  return user ?? Response.json({ error: "내 기록을 보려면 ChatGPT 로그인이 필요합니다." }, { status: 401 });
}
