import { createSaveGreeting } from "@/modules/example/application";
import { createInMemoryGreetingRepository } from "@/modules/example/infrastructure";

const greetingRepository = createInMemoryGreetingRepository();

export const saveGreeting = createSaveGreeting(greetingRepository);
