import { NextResponse } from "next/server";
import { z } from "zod";
import { saveGreeting } from "@/adapters/next/composition/example";

const requestSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const greeting = await saveGreeting(parsed.data.name);
  return NextResponse.json(greeting, { status: 201 });
}
