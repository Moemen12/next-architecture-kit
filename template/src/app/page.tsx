import { getGreeting } from "@/modules/example/backend/application";
import { GreetingCard } from "@/modules/example/frontend";

export default function Home() {
  const greeting = getGreeting("developer");

  return (
    <main className="shell">
      <p className="eyebrow">Next Architecture Kit</p>
      <h1>A strong default for projects that need room to grow.</h1>
      <p className="lede">
        Start with feature-oriented organization, explicit boundaries, and framework-neutral
        business policy. Upgrade to stricter Clean Architecture when the product earns it.
      </p>
      <GreetingCard message={greeting.message} />
    </main>
  );
}
