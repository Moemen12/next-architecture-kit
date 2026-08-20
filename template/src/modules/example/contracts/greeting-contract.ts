import { z } from "zod";

export const createGreetingRequest = z.object({
  name: z.string().trim().min(1).max(100),
});

export type CreateGreetingRequest = z.infer<typeof createGreetingRequest>;

export const greetingContract = z.object({
  message: z.string().min(1),
});

export type GreetingContract = z.infer<typeof greetingContract>;
