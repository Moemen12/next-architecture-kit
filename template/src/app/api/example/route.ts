import "server-only";

import { NextResponse } from "next/server";
import { saveGreeting } from "@/adapters/next/composition/example";
import { createGreetingRequest } from "@/modules/example/contracts";

export async function POST(request: Request) {
  const parsed = createGreetingRequest.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const greeting = await saveGreeting(parsed.data.name);
  return NextResponse.json(greeting, { status: 201 });
}
