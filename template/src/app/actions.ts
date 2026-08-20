"use server";

import { saveGreeting } from "@/adapters/next/composition/example";

export async function saveGreetingAction(formData: FormData) {
  const name = formData.get("name");

  if (typeof name !== "string" || name.trim().length === 0) {
    return { error: "A name is required" };
  }

  return { data: await saveGreeting(name) };
}
