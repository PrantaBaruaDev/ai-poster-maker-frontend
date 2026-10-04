"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/poster/StatusBadge";
import {
  useAdminPosters,
  useSetPosterFlag,
  useAdminDeletePoster,
} from "@/hooks/useAdmin";
import {
  Flag,
  FlagOff,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { AdminPosterListItem } from "@/types/api";

const PAGE_SIZE = 20;

export default function AdminPostersPage() {
  const [tab, setTab] = useState<"flagged" | "all">("flagged");
  const [page, setPage] = useState(1);

  const flaggedFilter = tab === "flagged" ? true : undefined;

  const { data, isLoading } = useAdminPosters({
    flagged: flaggedFilter,
    page,
    limit: PAGE_SIZE,
  });

  const posters = data?.posters ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const setFlag = useSetPosterFlag();
  const deletePoster = useAdminDeletePoster();

  const [flagDialog, setFlagDialog] = useState<{
    open: boolean;
    poster: AdminPosterListItem | null;
    nextState: boolean;
  }>({ open: false, poster: null, nextState: true });

  const [flagReason, setFlagReason] = useState("");

  const openFlagDialog = (poster: AdminPosterListItem) => {
    setFlagDialog({ open: true, poster, nextState: !poster.isFlagged });
    setFlagReason("");
  };

  const confirmFlag = async () => {
    if (!flagDialog.poster) return;
    await setFlag.mutateAsync({
      id: flagDialog.poster.id,
      isFlagged: flagDialog.nextState,
      ...(flagDialog.nextState && flagReason.trim() && { reason: flagReason.trim() }),
    });
    setFlagDialog({ open: false, poster: null, nextState: true });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Moderation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review flagged posters, remove inappropriate content.
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as "flagged" | "all");
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="flagged">
            <Flag className="mr-2 h-3.5 w-3.5" />
            Flagged
          </TabsTrigger>
          <TabsTrigger value="all">All posters</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {meta?.total ?? 0} poster{(meta?.total ?? 0) === 1 ? "" : "s"}
          </CardTitle>
          <CardDescription>
            {tab === "flagged"
              ? "Only posters that have been flagged by admins."
              : "Every poster in the system, newest first."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Headline</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Flagged</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posters.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="h-14 w-11 overflow-hidden rounded border bg-muted">
                        {p.generatedImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.generatedImageUrl}
                            alt={p.formData.headline}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                            N/A
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <p className="line-clamp-1 font-medium font-[family-name:var(--font-headline)]">
                        {p.formData.headline}
                      </p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {p.formData.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="line-clamp-1 text-sm">{p.user.name}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {p.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {p.template.title}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      {p.isFlagged ? (
                        <Badge
                          variant="outline"
                          className="border-transparent bg-red-100 text-red-800"
                        >
                          Flagged
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {p.generatedImageUrl && (
                          <Button
                            render={
                            <Link href={p.generatedImageUrl} 
                              target="_blank"
                              rel="noopener noreferrer" />
                            }
                            nativeButton={false}
                            variant="ghost"
                            size="icon"
                            title="Open image"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className={p.isFlagged ? "text-emerald-600" : "text-amber-600"}
                          onClick={() => openFlagDialog(p)}
                          title={p.isFlagged ? "Unflag" : "Flag"}
                        >
                          {p.isFlagged ? (
                            <FlagOff className="h-4 w-4" />
                          ) : (
                            <Flag className="h-4 w-4" />
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this poster?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently deletes the poster and its
                                generation logs. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePoster.mutate(p.id)}
                                disabled={deletePoster.isPending}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {posters.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      {tab === "flagged"
                        ? "No flagged posters. All clear. ✓"
                        : "No posters yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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

      {/* Flag with reason dialog */}
      <Dialog
        open={flagDialog.open}
        onOpenChange={(open) =>
          setFlagDialog((s) => ({ ...s, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {flagDialog.nextState ? "Flag this poster" : "Remove flag"}
            </DialogTitle>
            <DialogDescription>
              {flagDialog.nextState
                ? "The poster will be added to the moderation queue."
                : "The poster will no longer appear in the moderation queue."}
            </DialogDescription>
          </DialogHeader>

          {flagDialog.nextState && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                rows={3}
                placeholder="Defamatory content, unauthorized photo, etc."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFlagDialog((s) => ({ ...s, open: false }))}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmFlag}
              disabled={setFlag.isPending}
              className={
                flagDialog.nextState
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : ""
              }
            >
              {setFlag.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {flagDialog.nextState ? "Flag poster" : "Remove flag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}