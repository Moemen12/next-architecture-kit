import { createSaveGreeting } from "@/modules/example/backend/application";
import { createInMemoryGreetingRepository } from "@/modules/example/backend/infrastructure";

const greetingRepository = createInMemoryGreetingRepository();

export const saveGreeting = createSaveGreeting(greetingRepository);
