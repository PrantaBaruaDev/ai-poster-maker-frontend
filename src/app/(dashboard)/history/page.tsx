"use client";

import { useState } from "react";
import Link from "next/link";
import { usePosterHistory, useDeletePoster } from "@/hooks/usePosters";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/poster/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2, Eye, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 9;

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePosterHistory(page, PAGE_SIZE);
  const deletePoster = useDeletePoster();

  const posters = data?.posters ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Posters</h1>
          <p className="mt-1 text-muted-foreground">
            {meta?.total ?? 0} total • Re-download or regenerate any time.
          </p>
        </div>
        <Button render={<Link href="/create" />} nativeButton={true}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New poster
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : posters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-lg font-semibold">No posters yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Generate your first poster and it will show up here.
            </p>
            <Button render={<Link href="/create"/>} nativeButton={true} className="mt-6">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create poster
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posters.map((p) => (
              <Card key={p.id} className="overflow-hidden group">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/5 to-accent/10">
                  {p.status === "COMPLETED" && p.generatedImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.generatedImageUrl}
                      alt={p.formData.headline}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <StatusBadge status={p.status} />
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1 text-base font-[family-name:var(--font-headline)]">
                    {p.formData.headline}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {p.formData.name}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex items-center gap-2 pt-0">
                  <Button render={<Link href={`/preview/${p.id}`}/>} nativeButton={true} variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    View
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger render={ <Button variant="ghost" size="icon" className="text-destructive"/> }
                      nativeButton={true}
                    >
                      <Trash2 className="h-4 w-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this poster?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes the poster from your history.
                          The image URL will stop working.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deletePoster.mutate(p.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}