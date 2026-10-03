import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-[family-name:var(--font-headline)] text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          AI Political Poster Maker
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Generate print-ready Bangla political posters — victory day, condolence,
          campaign — in seconds.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/register">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}