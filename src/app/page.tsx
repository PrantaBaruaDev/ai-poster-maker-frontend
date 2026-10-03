import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  Wand2,
  Download,
  Zap,
  Palette,
  Type,
  ArrowRight,
  Check,
} from "lucide-react";

const FEATURES = [
  {
    icon: Wand2,
    title: "AI-designed layouts",
    description:
      "Gemini picks colors, crops, and headline sizing that match the occasion — no design skills needed.",
  },
  {
    icon: Type,
    title: "Perfect Bangla text",
    description:
      "Text is rendered by a real browser engine, so conjuncts and matras are always correct.",
  },
  {
    icon: Palette,
    title: "Curated templates",
    description:
      "Victory Day, condolence, campaign, greetings — pre-built in authentic Bangladeshi poster style.",
  },
  {
    icon: Download,
    title: "Print-ready output",
    description:
      "1200×1600 PNG, ready for offset or digital print. No pixelation, no re-export.",
  },
  {
    icon: Zap,
    title: "Ready in seconds",
    description:
      "Fill a form, upload photos, and get a finished poster in under 10 seconds.",
  },
  {
    icon: Sparkles,
    title: "Regenerate freely",
    description:
      "Not happy? Tweak the text and regenerate up to 3 times per poster.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Pick a template",
    description: "Choose an occasion — victory, mourning, campaign, or festival.",
  },
  {
    number: "02",
    title: "Fill in the details",
    description: "Name, designation, party, headline. Upload up to 3 photos.",
  },
  {
    number: "03",
    title: "Download the poster",
    description: "AI composes the layout. You get a print-ready PNG.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="pointer-events-none absolute -top-32 right-0 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 left-0 -z-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            AI-Powered Poster Design
          </div>

          <h1 className="mt-6 font-[family-name:var(--font-headline)] text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Print-ready Bangla posters{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              in seconds
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Generate political posters for victory day, condolence, campaign, or
            greetings — with the leader photos, floral borders, and accurate
            Bangla headlines you need.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" render={<Link href="/register" />} nativeButton={false}>
              Start creating free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="#how-it-works" />}
              nativeButton={false}
            >
              See how it works
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            No credit card. Free to use.
          </p>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────── */}
      <section id="features" className="border-t border-border/40 bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Features
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-3xl font-bold sm:text-4xl">
              Everything a poster designer does — automated
            </h2>
            <p className="mt-3 text-muted-foreground">
              From template selection to final export, every step is handled for you.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="border-border/60 bg-background/60">
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="mt-3 text-lg">{f.title}</CardTitle>
                    <CardDescription>{f.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How it works ──────────────────────────────── */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-3xl font-bold sm:text-4xl">
              Three steps to a finished poster
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.number} className="relative">
                <div className="font-[family-name:var(--font-headline)] text-5xl font-extrabold text-primary/20">
                  {s.number}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Templates preview ─────────────────────────── */}
      <section
        id="templates"
        className="border-t border-border/40 bg-muted/20 py-20"
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Templates
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-3xl font-bold sm:text-4xl">
              Built for every occasion
            </h2>
            <p className="mt-3 text-muted-foreground">
              Pre-designed in the authentic style of Bangladeshi political posters.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              { name: "বিজয় দিবস", desc: "Victory Day · green & red", emoji: "🇧🇩" },
              { name: "শোক / স্মরণ", desc: "Mourning · restrained black & gold", emoji: "🕯️" },
              { name: "নির্বাচনী প্রচার", desc: "Campaign · bold contrast", emoji: "📣" },
            ].map((t) => (
              <Card key={t.name} className="overflow-hidden">
                <div className="flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 text-6xl">
                  {t.emoji}
                </div>
                <CardHeader>
                  <CardTitle className="font-[family-name:var(--font-headline)]">
                    {t.name}
                  </CardTitle>
                  <CardDescription>{t.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────── */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              FAQ
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-3xl font-bold sm:text-4xl">
              Common questions
            </h2>
          </div>

          <div className="mt-12 space-y-6">
            {[
              {
                q: "Is the Bangla text accurate?",
                a: "Yes. We render text with a real browser engine, not an AI image model. Conjuncts, matras, and spellings are always exact.",
              },
              {
                q: "What output do I get?",
                a: "A 1200×1600 PNG file, ready for print. Download it any time from your history.",
              },
              {
                q: "How many photos can I add?",
                a: "Up to 3, depending on the template. Victory and campaign templates take 2, mourning takes 1.",
              },
              {
                q: "Can I regenerate if I don't like the result?",
                a: "Yes — you can regenerate up to 3 times per poster, tweaking the text if needed.",
              },
            ].map((item) => (
              <div key={item.q} className="border-b border-border/60 pb-6">
                <h3 className="flex items-start gap-2 text-base font-semibold">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  {item.q}
                </h3>
                <p className="mt-2 pl-6 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────── */}
      <section className="border-t border-border/40 bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-[family-name:var(--font-headline)] text-3xl font-bold sm:text-4xl">
            Ready to design your first poster?
          </h2>
          <p className="mt-3 text-muted-foreground">
            It takes less than a minute. No design skills required.
          </p>
          <div className="mt-8">
            <Button size="lg" render={<Link href="/register" />} nativeButton={false}>
              Get started — it&apos;s free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────── */}
      <footer className="border-t border-border/40 bg-muted/30 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Poster Maker</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AI Political Poster Maker. Built for Bangladesh.
          </p>
        </div>
      </footer>
    </div>
  );
}