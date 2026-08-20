import { z } from "zod";

export const greetingContract = z.object({
  message: z.string().min(1),
});

export type GreetingContract = z.infer<typeof greetingContract>;
