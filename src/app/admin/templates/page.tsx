"use client";

import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateFormDialog } from "@/components/admin/TemplateFormDialog";
import {
  useAdminTemplates,
  useDeactivateTemplate,
} from "@/hooks/useAdmin";
import { Plus, Pencil, Power, Loader2 } from "lucide-react";
import type { AdminTemplateListItem, OccasionType } from "@/types/api";

const OCCASION_BADGE: Record<OccasionType, { label: string; className: string }> = {
  VICTORY: { label: "Victory", className: "bg-emerald-100 text-emerald-800" },
  MOURNING: { label: "Mourning", className: "bg-slate-200 text-slate-800" },
  CAMPAIGN: { label: "Campaign", className: "bg-amber-100 text-amber-800" },
  GREETINGS: { label: "Greetings", className: "bg-blue-100 text-blue-800" },
  FESTIVAL: { label: "Festival", className: "bg-purple-100 text-purple-800" },
};

export default function AdminTemplatesPage() {
  const { data: templates, isLoading } = useAdminTemplates();
  const deactivate = useDeactivateTemplate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTemplateListItem | null>(null);

  const handleNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (t: AdminTemplateListItem) => {
    setEditing(t);
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, and manage poster templates.
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          New template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {templates?.length ?? 0} template
            {templates?.length === 1 ? "" : "s"}
          </CardTitle>
          <CardDescription>
            Deactivating a template hides it from users. Existing posters stay intact.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Occasion</TableHead>
                  <TableHead>HTML</TableHead>
                  <TableHead className="text-center">Posters</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates?.map((t) => {
                  const badge = OCCASION_BADGE[t.occasionType];
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        <span className="font-[family-name:var(--font-headline)]">
                          {t.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {t.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`border-transparent ${badge.className}`}
                        >
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {t.htmlTemplateKey}.hbs
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {t._count.posters}
                      </TableCell>
                      <TableCell>
                        {t.isActive ? (
                          <Badge
                            variant="outline"
                            className="border-transparent bg-emerald-100 text-emerald-800"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-transparent bg-slate-200 text-slate-700"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(t)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {t.isActive && (
                            <AlertDialog>
                              <AlertDialogTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-amber-600"
                                    title="Deactivate"
                                  >
                                    <Power className="h-4 w-4" />
                                  </Button>
                                }
                              />
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Deactivate &ldquo;{t.title}&rdquo;?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Users will no longer see this template when
                                    creating posters. Existing posters stay
                                    intact, and you can reactivate it later.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deactivate.mutate(t.id)}
                                    disabled={deactivate.isPending}
                                    className="bg-amber-600 text-white hover:bg-amber-700"
                                  >
                                    {deactivate.isPending && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Deactivate
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {templates?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      No templates yet. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TemplateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editing}
      />
    </div>
  );
}