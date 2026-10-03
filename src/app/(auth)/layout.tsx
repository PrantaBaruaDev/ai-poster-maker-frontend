import { Navbar } from "@/components/marketing/Navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden p-4 py-12">
        {/* Decorative gradients behind the form */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="pointer-events-none absolute -top-24 right-0 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}