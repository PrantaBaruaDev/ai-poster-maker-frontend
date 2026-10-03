"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu, Sparkles, LayoutGrid } from "lucide-react";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#templates", label: "Templates" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const { data: user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-[family-name:var(--font-headline)] text-base font-extrabold tracking-tight text-foreground">
              Poster Maker
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              AI for Bangla
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <Button render={<Link href="/dashboard" />} nativeButton={false}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                render={<Link href="/login" />}
                nativeButton={false}
              >
                Log in
              </Button>
              <Button render={<Link href="/register" />} nativeButton={false}>
                Get started
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="right" className="w-72">
            <div className="mt-8 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-3 h-px bg-border" />

              {user ? (
                <Button
                  render={<Link href="/dashboard" onClick={() => setOpen(false)} />}
                  nativeButton={false}
                  className="w-full"
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    render={<Link href="/login" onClick={() => setOpen(false)} />}
                    nativeButton={false}
                  >
                    Log in
                  </Button>
                  <Button
                    className="w-full"
                    render={<Link href="/register" onClick={() => setOpen(false)} />}
                    nativeButton={false}
                  >
                    Get started
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}