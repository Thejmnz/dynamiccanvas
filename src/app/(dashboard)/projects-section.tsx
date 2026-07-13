"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  AlertTriangle,
  Search,
  MoreHorizontal,
  Copy,
  Trash,
  Loader,
  Folder,
  FolderPlus,
  Crown,
  FolderInput,
  X,
  Tag,
  FileText,
  Download,
  Layers3,
  Images,
  CopyPlus,
  Info,
  Check,
  GitMerge,
} from "lucide-react";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useDuplicateProject } from "@/features/projects/api/use-duplicate-project";
import { useDeleteProject } from "@/features/projects/api/use-delete-project";
import { useConfirm } from "@/hooks/use-confirm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hint } from "@/components/hint";
import { Textarea } from "@/components/ui/textarea";
import { startPageTransition } from "@/components/page-transition-loader";
import { supabase } from "@/lib/supabaseClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TemplateFolder = {
  id: string;
  name: string;
};

const ProjectThumbnail = ({ project }: { project: any }) => {
  const { t } = useLanguage();

  // Si tiene thumbnailUrl guardado en DB, mostrarlo
  if (project.thumbnailUrl) {
    return (
      <img
        src={project.thumbnailUrl}
        alt={project.name}
        className="absolute inset-0 h-full w-full object-contain object-center p-3 drop-shadow-[0_8px_10px_rgba(16,20,38,0.22)]"
      />
    );
  }

  // Placeholder si no hay thumbnail
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f1f1ee]">
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
  const [descriptionProject, setDescriptionProject] = useState<any | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [tagsProject, setTagsProject] = useState<any | null>(null);
  const [tagsDraft, setTagsDraft] = useState("");
  const [metadataBusy, setMetadataBusy] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkTagsOpen, setBulkTagsOpen] = useState(false);
  const [bulkTagsDraft, setBulkTagsDraft] = useState("");
  const duplicateMutation = useDuplicateProject();
  const removeMutation = useDeleteProject();
  const router = useRouter();
  const {
    data,
    status,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  } = useGetProjects();

  const loadFolders = async () => {
    try {
      const foldersResponse = await fetch("/api/folders");

      if (foldersResponse.ok) {
        const result = await foldersResponse.json();
        setFolders(result.data || []);
        setFoldersPaid(Boolean(result.paid));
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

  const onDuplicate = (id: string) => {
    duplicateMutation.mutate({ id });
  };

  const navigateTo = (href: string) => {
    startPageTransition();
    router.push(href);
  };

  const copyTemplateId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success(language === "es" ? "ID de plantilla copiado" : "Template ID copied");
    } catch {
      toast.error(language === "es" ? "No se pudo copiar el ID" : "Could not copy the ID");
    }
  };

  const downloadTemplate = (project: any) => {
    const blob = new Blob([project.json || "{}"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${String(project.name || "template").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const saveMetadata = async (projectId: string, values: Record<string, unknown>) => {
    setMetadataBusy(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("dynamic_canvas_templates")
        .update({ ...values, updatedAt: now, lastModified: now })
        .eq("id", projectId);
      if (error) throw error;
      await refetch();
      toast.success(language === "es" ? "Plantilla actualizada" : "Template updated");
      setDescriptionProject(null);
      setTagsProject(null);
    } catch (metadataError: any) {
      toast.error(metadataError.message || (language === "es" ? "No se pudo actualizar" : "Could not update"));
    } finally {
      setMetadataBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    const ok = await confirm();

    if (ok) {
      removeMutation.mutate({ id });
    }
  };

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

  const toggleSelected = (projectId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const moveSelectedToFolder = async (folderId: string | null) => {
    if (selectedIds.size === 0) return;
    if (!foldersPaid) {
      toast.info(language === "es" ? "Las carpetas requieren un plan de pago" : "Folders require a paid plan");
      navigateTo("/dashboard/pricing");
      return;
    }

    setBulkBusy(true);
    try {
      const responses = await Promise.all(
        [...selectedIds].map((templateId) =>
          fetch(`/api/folders/${folderId || "root"}/templates/${templateId}`, { method: "PATCH" }),
        ),
      );
      if (responses.some((response) => !response.ok)) throw new Error();
      await refetch();
      clearSelection();
      toast.success(language === "es" ? "Plantillas movidas" : "Templates moved");
    } catch {
      toast.error(language === "es" ? "No se pudieron mover las plantillas" : "Could not move templates");
    } finally {
      setBulkBusy(false);
    }
  };

  const addTagsToSelected = async () => {
    const nextTags = [...new Set(bulkTagsDraft.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
    if (selectedIds.size === 0 || nextTags.length === 0) return;

    setBulkBusy(true);
    try {
      const selectedProjects = allProjects.filter((project) => selectedIds.has(project.id));
      const now = new Date().toISOString();
      const results = await Promise.all(
        selectedProjects.map((project) => {
          const currentTags = Array.isArray(project.tags) ? project.tags : [];
          return supabase
            .from("dynamic_canvas_templates")
            .update({
              tags: [...new Set([...currentTags, ...nextTags])],
              updatedAt: now,
              lastModified: now,
            })
            .eq("id", project.id);
        }),
      );
      const failed = results.find(({ error }) => error);
      if (failed?.error) throw failed.error;
      await refetch();
      setBulkTagsOpen(false);
      setBulkTagsDraft("");
      clearSelection();
      toast.success(language === "es" ? "Etiquetas agregadas" : "Tags added");
    } catch (bulkTagsError: any) {
      toast.error(bulkTagsError.message || (language === "es" ? "No se pudieron agregar las etiquetas" : "Could not add tags"));
    } finally {
      setBulkBusy(false);
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const ok = await confirm();
    if (!ok) return;

    setBulkBusy(true);
    try {
      const ids = [...selectedIds];
      const { error } = await supabase
        .from("dynamic_canvas_templates")
        .delete()
        .in("id", ids);
      if (error) throw error;
      await refetch();
      clearSelection();
      toast.success(language === "es" ? `${ids.length} plantillas eliminadas` : `${ids.length} templates deleted`);
    } catch (bulkDeleteError: any) {
      toast.error(bulkDeleteError.message || (language === "es" ? "No se pudieron eliminar las plantillas" : "Could not delete templates"));
    } finally {
      setBulkBusy(false);
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

  useEffect(() => {
    const availableIds = new Set(allProjects.map((project) => project.id));
    setSelectedIds((current) => {
      const next = new Set([...current].filter((id) => availableIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [allProjects]);

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

  const allVisibleSelected = filteredProjects.length > 0
    && filteredProjects.every((project) => selectedIds.has(project.id));

  if (status === "pending") {
    return (
      <div className="animate-pulse space-y-7" aria-label={language === "es" ? "Cargando plantillas" : "Loading templates"}>
        <div className="flex items-end justify-between gap-4">
          <div className="h-12 w-64 rounded-2xl bg-[#101426]/[0.08]" />
          <div className="h-11 w-40 rounded-full bg-[#101426]/[0.08]" />
        </div>
        <div className="h-12 max-w-lg rounded-xl bg-[#101426]/[0.08]" />
        <div className="h-10 w-24 rounded-xl bg-[#101426]/[0.08]" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="overflow-hidden rounded-[22px] border-2 border-[#101426]/10 bg-white">
              <div className="aspect-square bg-[#e9e5ff]" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 rounded bg-[#101426]/10" />
                <div className="h-3 w-1/2 rounded bg-[#101426]/[0.08]" />
                <div className="h-9 rounded-lg bg-[#101426]/[0.08]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
    <div className={`space-y-7 ${selectedIds.size > 0 ? "pb-28" : ""}`}>
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

      <Dialog open={Boolean(descriptionProject)} onOpenChange={(open) => !open && setDescriptionProject(null)}>
        <DialogContent className="max-w-lg rounded-[24px] border-2 border-[#101426] p-6 shadow-[7px_7px_0_#101426]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <FileText className="size-6 text-[#5b35d5]" />
              {language === "es" ? "Descripción de la plantilla" : "Template description"}
            </DialogTitle>
            <DialogDescription>
              {descriptionProject?.name}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            autoFocus
            value={descriptionDraft}
            onChange={(event) => setDescriptionDraft(event.target.value)}
            rows={5}
            maxLength={500}
            placeholder={language === "es" ? "¿Para qué sirve esta plantilla?" : "What is this template for?"}
            className="mt-2 resize-none border-2 border-[#101426]/20"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDescriptionProject(null)}>{language === "es" ? "Cancelar" : "Cancel"}</Button>
            <Button
              disabled={metadataBusy || !descriptionProject}
              onClick={() => descriptionProject && void saveMetadata(descriptionProject.id, { description: descriptionDraft.trim() })}
              className="bg-[#5b35d5] font-black hover:bg-[#101426]"
            >
              {metadataBusy ? <Loader className="size-4 animate-spin" /> : (language === "es" ? "Guardar" : "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(tagsProject)} onOpenChange={(open) => !open && setTagsProject(null)}>
        <DialogContent className="max-w-lg rounded-[24px] border-2 border-[#101426] p-6 shadow-[7px_7px_0_#101426]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <Tag className="size-6 text-[#5b35d5]" />
              {language === "es" ? "Etiquetas" : "Tags"}
            </DialogTitle>
            <DialogDescription>
              {language === "es" ? "Separa las etiquetas con comas." : "Separate tags with commas."}
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={tagsDraft}
            onChange={(event) => setTagsDraft(event.target.value)}
            placeholder={language === "es" ? "instagram, campaña, cliente" : "instagram, campaign, client"}
            className="mt-2 h-12 border-2 border-[#101426]/20"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagsProject(null)}>{language === "es" ? "Cancelar" : "Cancel"}</Button>
            <Button
              disabled={metadataBusy || !tagsProject}
              onClick={() => tagsProject && void saveMetadata(tagsProject.id, {
                tags: [...new Set(tagsDraft.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))],
              })}
              className="bg-[#5b35d5] font-black hover:bg-[#101426]"
            >
              {metadataBusy ? <Loader className="size-4 animate-spin" /> : (language === "es" ? "Guardar" : "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkTagsOpen} onOpenChange={(open) => { if (!bulkBusy) setBulkTagsOpen(open); }}>
        <DialogContent className="max-w-lg rounded-[24px] border-2 border-[#101426] p-6 shadow-[7px_7px_0_#101426]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <Tag className="size-6 text-[#5b35d5]" />
              {language === "es" ? "Agregar etiquetas" : "Add tags"}
            </DialogTitle>
            <DialogDescription>
              {language === "es"
                ? `Se agregarán a ${selectedIds.size} plantillas sin borrar sus etiquetas actuales.`
                : `They will be added to ${selectedIds.size} templates without removing their current tags.`}
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={bulkTagsDraft}
            onChange={(event) => setBulkTagsDraft(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") void addTagsToSelected(); }}
            placeholder={language === "es" ? "instagram, campaña, cliente" : "instagram, campaign, client"}
            className="mt-2 h-12 border-2 border-[#101426]/20"
          />
          <DialogFooter>
            <Button variant="outline" disabled={bulkBusy} onClick={() => setBulkTagsOpen(false)}>
              {language === "es" ? "Cancelar" : "Cancel"}
            </Button>
            <Button
              disabled={bulkBusy || !bulkTagsDraft.trim()}
              onClick={() => void addTagsToSelected()}
              className="bg-[#5b35d5] font-black hover:bg-[#101426]"
            >
              {bulkBusy ? <Loader className="size-4 animate-spin" /> : (language === "es" ? "Agregar" : "Add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div data-onboarding="templates" className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
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
                  navigateTo("/dashboard/pricing");
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

      {selectedIds.size > 0 && (
        <div className="fixed bottom-5 left-1/2 z-[100] flex min-h-20 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center justify-center gap-3 overflow-x-auto rounded-[24px] border-2 border-[#101426] bg-white px-4 py-3 shadow-[7px_7px_0_rgba(16,20,38,.20)] sm:px-5 lg:left-[calc(50%+115px)] lg:max-w-[calc(100vw-262px)]">
          <div className="flex shrink-0 items-center gap-3 pr-3 sm:border-r sm:border-[#101426]/15">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#2165f5] text-lg font-black text-white">
              {selectedIds.size}
            </span>
            <span className="whitespace-nowrap text-sm font-black">
              {language === "es" ? "seleccionadas" : "selected"}
            </span>
          </div>

          <Button
            variant="ghost"
            className="h-11 shrink-0 rounded-xl px-4 font-bold"
            onClick={() => {
              setSelectedIds((current) => {
                const next = new Set(current);
                if (allVisibleSelected) filteredProjects.forEach((project) => next.delete(project.id));
                else filteredProjects.forEach((project) => next.add(project.id));
                return next;
              });
            }}
          >
            {allVisibleSelected
              ? (language === "es" ? "Deseleccionar visibles" : "Deselect visible")
              : (language === "es" ? "Seleccionar todas" : "Select all")}
          </Button>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={bulkBusy}
                className="h-11 shrink-0 rounded-xl border-2 border-[#101426]/15 px-4 font-bold"
              >
                {foldersPaid ? <FolderInput className="mr-2 size-5" /> : <Crown className="mr-2 size-5 text-[#e3a500]" />}
                {language === "es" ? "Mover a carpeta" : "Move to folder"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56 rounded-xl border-2 border-[#101426]/10 p-1.5">
              {!foldersPaid ? (
                <DropdownMenuItem onClick={() => navigateTo("/dashboard/pricing")} className="h-10 cursor-pointer rounded-lg">
                  <Crown className="mr-2 size-4 text-[#e3a500]" />
                  {language === "es" ? "Disponible en planes de pago" : "Available on paid plans"}
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem className="h-10 cursor-pointer rounded-lg" onClick={() => void moveSelectedToFolder(null)}>
                    {language === "es" ? "Sin carpeta" : "No folder"}
                  </DropdownMenuItem>
                  {folders.map((folder) => (
                    <DropdownMenuItem key={folder.id} className="h-10 cursor-pointer rounded-lg" onClick={() => void moveSelectedToFolder(folder.id)}>
                      <Folder className="mr-2 size-4 text-[#5b35d5]" />{folder.name}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Hint label={language === "es" ? "Próximamente" : "Coming soon"} side="bottom">
            <Button disabled className="h-11 shrink-0 rounded-xl border-2 px-4 font-bold">
              <GitMerge className="mr-2 size-5" />
              {language === "es" ? "Combinar" : "Merge"}
            </Button>
          </Hint>

          <Button
            variant="outline"
            disabled={bulkBusy}
            onClick={() => {
              if (!foldersPaid) {
                toast.info(language === "es" ? "Las etiquetas están disponibles en los planes de pago" : "Tags are available on paid plans");
                navigateTo("/dashboard/pricing");
                return;
              }
              setBulkTagsOpen(true);
            }}
            className="h-11 shrink-0 rounded-xl border-2 border-[#101426]/15 px-4 font-bold"
          >
            {foldersPaid ? <Tag className="mr-2 size-5" /> : <Crown className="mr-2 size-5 text-[#e3a500]" />}
            {language === "es" ? "Agregar etiquetas" : "Add tags"}
          </Button>

          <Button
            variant="outline"
            disabled={bulkBusy}
            onClick={() => void deleteSelected()}
            className="h-11 shrink-0 rounded-xl border-2 border-red-400 px-4 font-bold text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            {bulkBusy ? <Loader className="mr-2 size-5 animate-spin" /> : <Trash className="mr-2 size-5" />}
            {language === "es" ? "Eliminar" : "Delete"}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            aria-label={language === "es" ? "Cancelar selección" : "Clear selection"}
            onClick={clearSelection}
            className="ml-auto size-11 shrink-0 rounded-full"
          >
            <X className="size-6" />
          </Button>
        </div>
      )}

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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className={`group relative overflow-hidden rounded-[22px] border-2 bg-white transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_#101426] ${selectedIds.has(project.id) ? "border-[#2165f5] ring-4 ring-[#2165f5]/15 shadow-[6px_6px_0_#2165f5]" : "border-[#101426]"}`}
            >
              {/* Thumbnail */}
              <div
                className="relative aspect-square cursor-pointer overflow-hidden border-b-2 border-[#101426] bg-[#f1f1ee]"
                onClick={() => {
                  if (selectedIds.size > 0) toggleSelected(project.id);
                  else navigateTo(`/editor/${project.id}`);
                }}
              >
                <ProjectThumbnail project={project} />

                <button
                  type="button"
                  aria-label={selectedIds.has(project.id)
                    ? (language === "es" ? `Deseleccionar ${project.name}` : `Deselect ${project.name}`)
                    : (language === "es" ? `Seleccionar ${project.name}` : `Select ${project.name}`)}
                  aria-pressed={selectedIds.has(project.id)}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSelected(project.id);
                  }}
                  className={`absolute left-3 top-3 z-20 flex size-8 items-center justify-center rounded-full border-2 transition ${selectedIds.has(project.id) ? "border-[#2165f5] bg-[#2165f5] text-white opacity-100" : "border-white bg-white/90 text-transparent opacity-0 shadow-md hover:border-[#2165f5] group-hover:opacity-100"}`}
                >
                  <Check className="size-5" strokeWidth={3} />
                </button>

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
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-[330px] overflow-hidden rounded-[18px] border-2 border-[#101426]/15 bg-white p-0 shadow-[7px_7px_0_rgba(16,20,38,.14)]"
                    >
                      <DropdownMenuLabel className="border-b border-[#101426]/10 px-5 py-4 font-normal">
                        <p className="truncate text-lg font-black text-[#101426]">{project.name}</p>
                        <div className="mt-1 flex items-center justify-between gap-4 text-xs font-medium text-[#101426]/45">
                          <span>{project.width} × {project.height} px</span>
                          <span className="whitespace-nowrap">
                            {language === "es" ? "Editada" : "Edited"} {formatDistanceToNow(project.updatedAt, { addSuffix: true, locale: language === "es" ? es : undefined })}
                          </span>
                        </div>
                      </DropdownMenuLabel>

                      <div className="p-2">
                        <DropdownMenuItem
                          className="h-11 cursor-pointer gap-3 rounded-xl px-3 text-sm font-semibold"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (!foldersPaid) {
                              toast.info(language === "es" ? "Las etiquetas están disponibles en los planes de pago" : "Tags are available on paid plans");
                              navigateTo("/dashboard/pricing");
                              return;
                            }
                            setTagsProject(project);
                            setTagsDraft(Array.isArray(project.tags) ? project.tags.join(", ") : "");
                          }}
                        >
                          <Tag className="size-5 text-[#5b35d5]" />
                          {language === "es" ? "Agregar etiquetas" : "Add tags"}
                          {!foldersPaid && <Crown className="ml-auto size-5 text-[#e3a500]" />}
                        </DropdownMenuItem>

                        {foldersPaid ? (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="h-11 cursor-pointer gap-3 rounded-xl px-3 text-sm font-semibold">
                              <FolderInput className="size-5 text-[#5b35d5]" />
                              {language === "es" ? "Mover a carpeta" : "Move to folder"}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="min-w-52 rounded-xl border-2 border-[#101426]/10 p-1.5">
                              <DropdownMenuItem className="h-10 cursor-pointer rounded-lg" onClick={(event) => { event.stopPropagation(); void moveToFolder(project.id, null); }}>
                                {language === "es" ? "Sin carpeta" : "No folder"}
                              </DropdownMenuItem>
                              {folders.map((folder) => (
                                <DropdownMenuItem key={folder.id} className="h-10 cursor-pointer rounded-lg" onClick={(event) => { event.stopPropagation(); void moveToFolder(project.id, folder.id); }}>
                                  <Folder className="mr-2 size-4 text-[#5b35d5]" />{folder.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        ) : (
                          <DropdownMenuItem
                            className="h-11 cursor-pointer gap-3 rounded-xl px-3 text-sm font-semibold"
                            onClick={(event) => {
                              event.stopPropagation();
                              toast.info(language === "es" ? "Las carpetas requieren un plan de pago" : "Folders require a paid plan");
                              navigateTo("/dashboard/pricing");
                            }}
                          >
                            <FolderInput className="size-5 text-[#5b35d5]" />
                            {language === "es" ? "Mover a carpeta" : "Move to folder"}
                            <Crown className="ml-auto size-5 text-[#e3a500]" />
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem className="h-11 cursor-pointer gap-3 rounded-xl px-3 text-sm font-semibold" onClick={(event) => { event.stopPropagation(); void copyTemplateId(project.id); }}>
                          <Info className="size-5 text-[#5b35d5]" />
                          {language === "es" ? "Copiar ID de plantilla" : "Copy Template ID"}
                          <Copy className="ml-auto size-4 text-[#101426]/35" />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="h-11 cursor-pointer gap-3 rounded-xl px-3 text-sm font-semibold"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDescriptionProject(project);
                            setDescriptionDraft(project.description || "");
                          }}
                        >
                          <FileText className="size-5 text-[#5b35d5]" />
                          {language === "es" ? "Establecer descripción" : "Set description"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="h-11 cursor-pointer gap-3 rounded-xl px-3 text-sm font-semibold" onClick={(event) => { event.stopPropagation(); downloadTemplate(project); }}>
                          <Download className="size-5 text-[#5b35d5]" />
                          {language === "es" ? "Descargar JSON" : "Download JSON"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2 bg-[#101426]/10" />

                        <DropdownMenuItem className="h-11 cursor-pointer gap-3 rounded-xl px-3 text-sm font-semibold" onClick={(event) => { event.stopPropagation(); navigateTo(`/editor/${project.id}`); }}>
                          <Layers3 className="size-5 text-[#5b35d5]" />
                          {language === "es" ? "Capas" : "Layers"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="h-11 cursor-pointer gap-3 rounded-xl px-3 text-sm font-semibold" onClick={(event) => { event.stopPropagation(); navigateTo(`/renders?templateId=${project.id}`); }}>
                          <Images className="size-5 text-[#5b35d5]" />
                          {language === "es" ? "Renders" : "Renders"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2 bg-[#101426]/10" />

                        <DropdownMenuItem
                          className="h-11 cursor-pointer gap-3 rounded-xl px-3 text-sm font-semibold"
                          disabled={duplicateMutation.isPending}
                          onClick={(event) => { event.stopPropagation(); onDuplicate(project.id); }}
                        >
                          {duplicateMutation.isPending ? <Loader className="size-5 animate-spin" /> : <CopyPlus className="size-5 text-[#5b35d5]" />}
                          {language === "es" ? "Duplicar" : "Duplicate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="h-11 cursor-pointer gap-3 rounded-xl px-3 text-sm font-semibold text-red-500 focus:bg-red-50 focus:text-red-600"
                          disabled={removeMutation.isPending}
                          onClick={(event) => { event.stopPropagation(); void onDelete(project.id); }}
                        >
                          <Trash className="size-5" />
                          {language === "es" ? "Eliminar" : "Delete"}
                        </DropdownMenuItem>
                      </div>
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
                  onClick={() => navigateTo(`/editor/${project.id}`)}
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
