export type Greeting = Readonly<{
  message: string;
}>;

export function createGreeting(name: string): Greeting {
  const normalizedName = name.trim();
  const recipient = normalizedName.length > 0 ? normalizedName : "developer";

  return {
    message: `Hello, ${recipient}!`,
  };
}
