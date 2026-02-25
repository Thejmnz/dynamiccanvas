"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, Search, MoreHorizontal, CopyIcon, Trash, Loader } from "lucide-react";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useDuplicateProject } from "@/features/projects/api/use-duplicate-project";
import { useDeleteProject } from "@/features/projects/api/use-delete-project";
import { useConfirm } from "@/hooks/use-confirm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProjectThumbnail = ({ project }: { project: any }) => {
  const { t } = useLanguage();

  // Si tiene thumbnailUrl guardado en DB, mostrarlo
  if (project.thumbnailUrl) {
    return <img src={project.thumbnailUrl} alt={project.name} className="absolute inset-0 w-full h-full object-cover object-center" />;
  }

  // Placeholder si no hay thumbnail
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-4xl text-blue-200">📐</div>
      <div className="text-center">
        <p className="text-xs text-gray-600 font-medium">{project.width} × {project.height}</p>
        <p className="text-xs text-gray-400">{t("pixels")}</p>
      </div>
    </div>
  );
};

export const ProjectsSection = () => {
  const { t, language } = useLanguage();
  const [ConfirmDialog, confirm] = useConfirm(
    t("delete_project_confirm"),
    t("delete_project_confirm"),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const duplicateMutation = useDuplicateProject();
  const removeMutation = useDeleteProject();
  const router = useRouter();

  const onCopy = (id: string) => {
    duplicateMutation.mutate({ id });
  };

  const onDelete = async (id: string) => {
    const ok = await confirm();

    if (ok) {
      removeMutation.mutate({ id });
    }
  };

  const {
    data,
    status,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useGetProjects();

  // Flatten all projects from pages and filter by search query
  const allProjects = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.data);
  }, [data]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return allProjects;
    const query = searchQuery.toLowerCase();
    return allProjects.filter(project =>
      project.name.toLowerCase().includes(query)
    );
  }, [allProjects, searchQuery]);

  if (status === "pending") {
    return (
      <div className="space-y-4">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t("search_placeholder")}
              className="pl-10"
              disabled
            />
          </div>
        </div>
        <h3 className="font-semibold text-lg">
          {t("my_templates")}
        </h3>
        <div className="flex flex-col gap-y-4 items-center justify-center h-32">
          <Loader className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t("search_placeholder")}
              className="pl-10"
              disabled
            />
          </div>
        </div>
        <h3 className="font-semibold text-lg">
          {t("my_templates")}
        </h3>
        <div className="flex flex-col gap-y-4 items-center justify-center h-32">
          <AlertTriangle className="size-6 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Failed to load projects
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ConfirmDialog />

      {/* Search Bar - Centered */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-300" />
          <Input
            placeholder={t("search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 placeholder:text-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600"
          />
        </div>
      </div>

      <h3 className="font-semibold text-lg">
        {t("my_templates")}
      </h3>

      {filteredProjects.length === 0 && searchQuery && (
        <div className="flex flex-col gap-y-4 items-center justify-center h-32 border-2 border-dashed rounded-lg">
          <Search className="size-6 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            {t("no_results_found") || "No templates found"}
          </p>
        </div>
      )}

      {filteredProjects.length === 0 && !searchQuery && (
        <div className="flex flex-col gap-y-4 items-center justify-center h-32 border-2 border-dashed rounded-lg">
          <Search className="size-6 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            {t("search_placeholder")}
          </p>
        </div>
      )}

      {filteredProjects.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all">
              {/* Thumbnail */}
              <div
                className="aspect-[3/4] bg-white relative cursor-pointer overflow-hidden p-2"
                onClick={() => router.push(`/editor/${project.id}`)}
              >
                <ProjectThumbnail project={project} />

                {/* Menu button */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                      <DropdownMenuItem
                        className="h-10 cursor-pointer"
                        disabled={duplicateMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopy(project.id);
                        }}
                      >
                        <CopyIcon className="size-4 mr-2" />
                        {t("copy")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="h-10 cursor-pointer"
                        disabled={removeMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(project.id);
                        }}
                      >
                        <Trash className="size-4 mr-2" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <div>
                  <p className="font-medium text-sm truncate">{project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {project.width} x {project.height} px
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => router.push(`/editor/${project.id}`)}
                >
                  {t("open_in_editor")}
                </Button>

                {/* Updated time */}
                <div className="pt-1 border-t">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(project.updatedAt, {
                      addSuffix: true,
                      locale: language === "es" ? es : undefined,
                    })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {hasNextPage && !searchQuery && (
        <div className="w-full flex items-center justify-center pt-4">
          <Button
            variant="ghost"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};
