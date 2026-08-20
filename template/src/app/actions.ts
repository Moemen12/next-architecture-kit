"use server";
import "server-only";

import { saveGreeting } from "@/adapters/next";

export async function saveGreetingAction(formData: FormData) {
  const name = formData.get("name");

  if (typeof name !== "string" || name.trim().length === 0) {
    return { error: "A name is required" };
  }

  return { data: await saveGreeting(name) };
}
