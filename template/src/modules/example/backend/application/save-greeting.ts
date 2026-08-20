import type { GreetingRepository } from "../ports";
import { createGreeting } from "../domain/greeting";

export type SaveGreeting = (name: string) => Promise<Readonly<{ message: string }>>;

export function createSaveGreeting(repository: GreetingRepository): SaveGreeting {
  return async (name) => {
    const greeting = createGreeting(name);
    await repository.save(greeting);
    return greeting;
  };
}
