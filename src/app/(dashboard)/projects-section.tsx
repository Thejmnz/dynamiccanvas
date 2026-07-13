"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { AlertTriangle, Search, MoreHorizontal, CopyIcon, Trash, Loader, Folder, FolderPlus, Crown, MoveRight, X } from "lucide-react";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useDuplicateProject } from "@/features/projects/api/use-duplicate-project";
import { useDeleteProject } from "@/features/projects/api/use-delete-project";
import { useConfirm } from "@/hooks/use-confirm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hint } from "@/components/hint";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TemplateFolder = {
  id: string;
  name: string;
};

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
  const [folders, setFolders] = useState<TemplateFolder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [foldersPaid, setFoldersPaid] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderBusy, setFolderBusy] = useState(false);
  const duplicateMutation = useDuplicateProject();
  const removeMutation = useDeleteProject();
  const router = useRouter();

  const loadFolders = async () => {
    try {
      const [foldersResponse, creditsResponse] = await Promise.all([
        fetch("/api/folders"),
        fetch("/api/user-credits"),
      ]);

      if (foldersResponse.ok) {
        const result = await foldersResponse.json();
        setFolders(result.data || []);
      }

      if (creditsResponse.ok) {
        const credits = await creditsResponse.json();
        setFoldersPaid(["creator", "agency", "business", "unlimited"].includes(credits.plan));
      } else {
        setFoldersPaid(false);
      }
    } catch {
      setFoldersPaid(false);
      // The template list remains usable if folders cannot be loaded.
    }
  };

  useEffect(() => {
    void loadFolders();
    const refreshPlan = () => void loadFolders();
    window.addEventListener("focus", refreshPlan);
    return () => window.removeEventListener("focus", refreshPlan);
  }, []);

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
    refetch,
  } = useGetProjects();

  const createFolder = async () => {
    const name = folderName.trim();
    if (!name) return;
    setFolderBusy(true);
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create folder");
      setFolders((current) => [...current, result.data].sort((a, b) => a.name.localeCompare(b.name)));
      setActiveFolderId(result.data.id);
      setFolderName("");
      setFolderDialogOpen(false);
      toast.success(language === "es" ? "Carpeta creada" : "Folder created");
    } catch (folderError: any) {
      toast.error(folderError.message || (language === "es" ? "No se pudo crear la carpeta" : "Could not create folder"));
    } finally {
      setFolderBusy(false);
    }
  };

  const moveToFolder = async (templateId: string, folderId: string | null) => {
    try {
      const response = await fetch(`/api/folders/${folderId || "root"}/templates/${templateId}`, { method: "PATCH" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not move template");
      await refetch();
      toast.success(language === "es" ? "Plantilla movida" : "Template moved");
    } catch (moveError: any) {
      toast.error(moveError.message || (language === "es" ? "No se pudo mover" : "Could not move template"));
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setFolders((current) => current.filter((folder) => folder.id !== folderId));
      if (activeFolderId === folderId) setActiveFolderId(null);
      await refetch();
      toast.success(language === "es" ? "Carpeta eliminada; las plantillas volvieron a Inicio" : "Folder deleted; templates returned to Home");
    } catch {
      toast.error(language === "es" ? "No se pudo eliminar la carpeta" : "Could not delete folder");
    }
  };

  // Flatten all projects from pages and filter by search query
  const allProjects = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.data);
  }, [data]);

  const filteredProjects = useMemo(() => {
    const folderProjects = activeFolderId
      ? allProjects.filter((project) => project.folder_id === activeFolderId || project.folderId === activeFolderId)
      : allProjects;
    if (!searchQuery.trim()) return folderProjects;
    const query = searchQuery.toLowerCase();
    return folderProjects.filter(project =>
      project.name.toLowerCase().includes(query)
    );
  }, [allProjects, searchQuery, activeFolderId]);

  if (status === "pending") {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader className="size-6 animate-spin text-muted-foreground" />
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
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="max-w-md rounded-[24px] border-2 border-[#101426] p-6 shadow-[7px_7px_0_#101426]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <FolderPlus className="size-6 text-[#5b35d5]" />
              {language === "es" ? "Nueva carpeta" : "New folder"}
            </DialogTitle>
            <DialogDescription>
              {language === "es" ? "Organiza tus plantillas por cliente, campaña o proyecto." : "Organize templates by client, campaign or project."}
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") void createFolder(); }}
            placeholder={language === "es" ? "Nombre de la carpeta" : "Folder name"}
            className="mt-3 h-12 border-2 border-[#101426]/20"
            maxLength={60}
          />
          <Button onClick={() => void createFolder()} disabled={folderBusy || !folderName.trim()} className="mt-2 h-12 w-full rounded-full bg-[#5b35d5] font-black hover:bg-[#101426]">
            {folderBusy ? <Loader className="size-4 animate-spin" /> : (language === "es" ? "Crear carpeta" : "Create folder")}
          </Button>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-4xl font-black tracking-[-0.04em] text-[#101426] sm:text-5xl">{t("my_templates")}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Hint
            side="bottom"
            label={foldersPaid
              ? (language === "es" ? "Crear una carpeta" : "Create a folder")
              : (language === "es" ? "Disponible con Creator, Agency o Business" : "Available with Creator, Agency or Business")}
          >
            <Button
              onClick={() => {
                if (foldersPaid) setFolderDialogOpen(true);
                else {
                  toast.info(language === "es" ? "Las carpetas están disponibles en Creator, Agency y Business" : "Folders are available on Creator, Agency and Business");
                  router.push("/dashboard/pricing");
                }
              }}
              className={`h-11 rounded-full border-2 border-[#101426] px-5 font-black shadow-[4px_4px_0_#101426] ${foldersPaid ? "bg-[#c9ff5a] text-[#101426] hover:bg-white" : "bg-white text-[#101426] hover:bg-[#e9e5ff]"}`}
            >
              {foldersPaid ? <FolderPlus className="mr-2 size-4" /> : <Crown className="mr-2 size-4 text-[#d59b00]" />}
              {language === "es" ? "Nueva carpeta" : "New folder"}
            </Button>
          </Hint>
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

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFolderId(null)}
          className={`flex h-10 items-center gap-2 rounded-xl border-2 px-4 text-sm font-black transition ${activeFolderId === null ? "border-[#101426] bg-[#101426] text-white" : "border-[#101426]/15 bg-white hover:border-[#5b35d5]"}`}
        >
          <Folder className="size-4" />{language === "es" ? "Todas" : "All"}
        </button>
        {foldersPaid && folders.map((folder) => (
          <div key={folder.id} className={`flex h-10 items-center rounded-xl border-2 transition ${activeFolderId === folder.id ? "border-[#5b35d5] bg-[#e9e5ff]" : "border-[#101426]/15 bg-white hover:border-[#5b35d5]"}`}>
            <button onClick={() => setActiveFolderId(folder.id)} className="flex h-full items-center gap-2 pl-4 pr-2 text-sm font-black">
              <Folder className="size-4 text-[#5b35d5]" />{folder.name}
            </button>
            {foldersPaid && (
              <button aria-label={language === "es" ? `Eliminar carpeta ${folder.name}` : `Delete folder ${folder.name}`} onClick={() => void deleteFolder(folder.id)} className="mr-1 rounded-md p-1 text-[#101426]/30 hover:bg-white hover:text-red-500">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}
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
                      {foldersPaid && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="h-9 font-bold text-[#101426]/55" disabled>
                            <MoveRight className="size-4 mr-2" />
                            {language === "es" ? "Mover a carpeta" : "Move to folder"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="h-9 cursor-pointer pl-8" onClick={(event) => { event.stopPropagation(); void moveToFolder(project.id, null); }}>
                            {language === "es" ? "Sin carpeta" : "No folder"}
                          </DropdownMenuItem>
                          {folders.map((folder) => (
                            <DropdownMenuItem key={folder.id} className="h-9 cursor-pointer pl-8" onClick={(event) => { event.stopPropagation(); void moveToFolder(project.id, folder.id); }}>
                              {folder.name}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                      <DropdownMenuSeparator />
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
