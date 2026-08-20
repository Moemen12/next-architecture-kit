type GreetingCardProps = Readonly<{
  message: string;
}>;

export function GreetingCard({ message }: GreetingCardProps) {
  return (
    <section aria-labelledby="greeting-title">
      <p className="eyebrow">Example feature</p>
      <h2 id="greeting-title">{message}</h2>
    </section>
  );
}
