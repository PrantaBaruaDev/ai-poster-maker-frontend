"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, History, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { data: user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          স্বাগতম, {user?.name ?? "…"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Create print-ready Bangla political posters in seconds.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="mt-3">Create a new poster</CardTitle>
            <CardDescription>
              Pick a template, add your details, and let AI design the layout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Start creating
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <History className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="mt-3">Your poster history</CardTitle>
            <CardDescription>
              Re-download or regenerate any poster you&apos;ve created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/history">View history</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}