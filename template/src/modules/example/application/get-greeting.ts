import { createGreeting } from "../domain/greeting";

export type GetGreeting = (name?: string) => Readonly<{ message: string }>;

export const getGreeting: GetGreeting = (name = "developer") => createGreeting(name);
