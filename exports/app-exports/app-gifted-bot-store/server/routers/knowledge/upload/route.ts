import { db } from "@/server/db";
import { knowledgeEntries } from "@/drizzle/schema";

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get("file") as File;

  await db.insert(knowledgeEntries).values({
    type: "document",
    title: file.name,
    content: "Uploaded file",
  });

  return Response.json({ ok: true });
}
