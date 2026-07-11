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
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#e9e5ff] [background-image:radial-gradient(rgba(91,53,213,.18)_1px,transparent_1px)] [background-size:18px_18px]">
      <div className="text-4xl">📐</div>
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
    <div className="space-y-7">
      <ConfirmDialog />

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5b35d5]">Dynamic Canvas</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#101426] sm:text-5xl">{t("my_templates")}</h1>
          <p className="mt-2 text-sm font-medium text-[#101426]/50">{allProjects.length} {language === "es" ? "plantillas listas para editar y automatizar" : "templates ready to edit and automate"}</p>
        </div>
        <div className="rounded-full border-2 border-[#101426] bg-[#c9ff5a] px-4 py-2 text-xs font-black shadow-[4px_4px_0_#101426]">
          {language === "es" ? "Editor + API en un solo lugar" : "Editor + API in one place"}
        </div>
      </div>

      {/* Search Bar - Centered */}
      <div className="max-w-lg">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#5b35d5]" />
          <Input
            placeholder={t("search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 border-2 border-[#101426] bg-white pl-11 placeholder:text-[#101426]/30"
          />
        </div>
      </div>

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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="group relative overflow-hidden rounded-[22px] border-2 border-[#101426] bg-white transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_#101426]">
              {/* Thumbnail */}
              <div
                className="relative aspect-[3/4] cursor-pointer overflow-hidden border-b-2 border-[#101426] bg-[#e9e5ff]"
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
              <div className="space-y-3 p-4">
                <div>
                  <p className="truncate text-base font-black">{project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {project.width} x {project.height} px
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-[#101426]/20 bg-[#f6f5ef] text-xs hover:bg-[#c9ff5a]"
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
