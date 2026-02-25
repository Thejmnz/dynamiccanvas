"use client";

import { CiFileOn } from "react-icons/ci";
import { BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { useFilePicker } from "use-file-picker";
import { useMutationState } from "@tanstack/react-query";
import {
  ChevronDown,
  Download,
  Loader,
  Copy,
  Save,
  Grid3X3,
  Keyboard,
  FileText,
  Tag,
  Globe,
  Square,
  Layers,
  Info,
  Maximize2,
} from "lucide-react";

import { UserButton } from "@/features/auth/components/user-button";

import { ActiveTool, Editor } from "@/features/editor/types";
import { Logo } from "@/features/editor/components/logo";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useUpdateProject } from "@/features/projects/api/use-update-project";
import { useCreateProject } from "@/features/projects/api/use-create-project";

import { useLanguage } from "@/lib/contexts/LanguageContext";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface NavbarProps {
  id: string;
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  onSave?: () => void;
  onAutoSave?: () => void;
  showGrid?: boolean;
  onShowGridChange?: (value: boolean) => void;
  showPrintSafeZone?: boolean;
  onShowPrintSafeZoneChange?: (value: boolean) => void;
}

// Preset sizes
const presetSizes = [
  { nameKey: "preset_square", width: 1080, height: 1080 },
  { nameKey: "preset_instagram_post", width: 1080, height: 1350 },
  { nameKey: "preset_instagram_story", width: 1080, height: 1920 },
  { nameKey: "preset_landscape_post", width: 1080, height: 608 },
  { nameKey: "preset_twitter_post", width: 1600, height: 900 },
  { nameKey: "preset_twitter_banner", width: 1500, height: 500 },
  { nameKey: "preset_facebook_post", width: 1200, height: 630 },
  { nameKey: "preset_app_store_screenshot", width: 1290, height: 2796 },
  { nameKey: "preset_open_graph", width: 1200, height: 630 },
  { nameKey: "preset_youtube_thumbnail", width: 1280, height: 720 },
  { nameKey: "preset_tiktok_video", width: 1080, height: 1920 },
  { nameKey: "preset_linkedin_post", width: 1200, height: 627 },
  { nameKey: "preset_billboard", width: 970, height: 250 },
  { nameKey: "preset_a4_300dpi", width: 2480, height: 3508 },
  { nameKey: "preset_us_letter_300dpi", width: 2550, height: 3300 },
  { nameKey: "preset_us_legal_300dpi", width: 2550, height: 4200 },
];

export const Navbar = ({
  id,
  editor,
  activeTool,
  onChangeActiveTool,
  onSave,
  onAutoSave,
  showGrid = false,
  onShowGridChange,
  showPrintSafeZone = false,
  onShowPrintSafeZoneChange,
}: NavbarProps) => {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  // Fetch project data
  const { data: project } = useGetProject(id);
  const { mutate: updateProject } = useUpdateProject(id);
  const { mutate: createProject, isPending: isDuplicating } = useCreateProject();

  const [autoSave, setAutoSave] = useState(true);
  const [projectDescription, setProjectDescription] = useState("");
  const [templateWidth, setTemplateWidth] = useState(editor?.getWorkspace?.()?.width || 1080);
  const [templateHeight, setTemplateHeight] = useState(editor?.getWorkspace?.()?.height || 1350);

  // Modal states
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [tempDescription, setTempDescription] = useState("");
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [tempTags, setTempTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  const data = useMutationState({
    filters: {
      mutationKey: ["project", { id }],
      exact: true,
    },
    select: (mutation) => mutation.state.status,
  });

  const currentStatus = data[data.length - 1];
  const isError = currentStatus === "error";
  const isPending = currentStatus === "pending";

  const { openFilePicker } = useFilePicker({
    accept: ".json",
    onFilesSuccessfullySelected: ({ plainFiles }: any) => {
      if (plainFiles && plainFiles.length > 0) {
        const file = plainFiles[0];
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = () => {
          editor?.loadJson(reader.result as string);
        };
      }
    },
  });

  // Update template dimensions when workspace changes
  useEffect(() => {
    const workspace = editor?.getWorkspace?.();
    if (workspace) {
      setTemplateWidth(workspace.width);
      setTemplateHeight(workspace.height);
    }
  }, [editor?.getWorkspace?.()?.width, editor?.getWorkspace?.()?.height]);

  // Auto-save every 10 seconds (silently, no toasts)
  useEffect(() => {
    if (autoSave && onAutoSave) {
      autoSaveRef.current = setInterval(() => {
        onAutoSave();
      }, 10000); // 10 seconds
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [autoSave, onAutoSave]);

  const handleNameChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (newName && newName !== project?.name) {
      updateProject({ name: newName });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const copyTemplateId = () => {
    navigator.clipboard.writeText(id);
    toast.success(t("menu_template_id_copied"));
  };

  const duplicateTemplate = () => {
    if (!project) return;

    const projectData = {
      name: `${project.name || "Untitled"} (Copy)`,
      width: templateWidth,
      height: templateHeight,
      json: project.json || JSON.stringify({ version: "2.0", workspace: { width: templateWidth, height: templateHeight }, elements: [] }),
    };

    createProject(projectData);
  };

  const openDescriptionModal = () => {
    setTempDescription(projectDescription);
    setIsDescriptionModalOpen(true);
  };

  const saveDescription = () => {
    setProjectDescription(tempDescription);
    updateProject({ description: tempDescription });
    setIsDescriptionModalOpen(false);
    toast.success(t("menu_description_saved"));
  };

  const openTagsModal = () => {
    setTempTags(project?.tags || []);
    setIsTagsModalOpen(true);
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tempTags.includes(trimmedTag)) {
      setTempTags([...tempTags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTempTags(tempTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const saveTags = () => {
    updateProject({ tags: tempTags });
    setIsTagsModalOpen(false);
    toast.success(t("menu_tags_saved"));
  };

  const handleResize = (width: number, height: number) => {
    setTemplateWidth(width);
    setTemplateHeight(height);
    editor?.changeSize?.(width, height);
    toast.success(`${t("menu_canvas_resized")} ${width} x ${height}px`);
  };

  const handleCustomResize = () => {
    const width = Number(templateWidth);
    const height = Number(templateHeight);
    if (width > 0 && height > 0) {
      handleResize(width, height);
    }
  };

  // Format last updated date
  const formatLastSaved = () => {
    if (!project?.updatedAt) return t("menu_not_saved_yet");
    const date = new Date(project.updatedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? t("menu_just_now") : `${diffMinutes} ${t("menu_minutes_ago")}`;
      }
      return `${diffHours} ${t("menu_hours_ago")}`;
    } else if (diffDays === 1) {
      return t("menu_yesterday");
    } else {
      return `${diffDays} ${t("menu_days_ago")}`;
    }
  };

  return (
    <nav className="w-full flex items-center p-4 h-[68px] gap-x-8 border-b lg:pl-[34px]">
      <Logo />
      <div className="w-full flex items-center gap-x-1 h-full">
        {/* File Menu */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              {t("menu_file")}
              <ChevronDown className="size-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-72">
            {/* Template Info Section */}
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {project?.name || t("menu_unnamed_template")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {templateWidth} x {templateHeight} px
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("menu_saved")} {formatLastSaved()}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Template ID */}
            <DropdownMenuItem className="flex items-center justify-between gap-x-2" onSelect={(e) => e.preventDefault()}>
              <div className="flex items-center gap-x-2">
                <Info className="size-4" />
                <span className="text-sm">{t("menu_template_id")}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  copyTemplateId();
                }}
              >
                <Copy className="size-3 mr-1" />
                {language === "es" ? "Copiar" : "Copy"}
              </Button>
            </DropdownMenuItem>

            {/* Set Description */}
            <DropdownMenuItem
              className="flex items-center gap-x-2"
              onClick={openDescriptionModal}
            >
              <FileText className="size-4" />
              {t("menu_set_description")}
            </DropdownMenuItem>

            {/* Add Tags */}
            <DropdownMenuItem
              className="flex items-center gap-x-2"
              onClick={openTagsModal}
            >
              <Tag className="size-4" />
              {t("menu_add_tags")}
            </DropdownMenuItem>

            {/* Language */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-x-2">
                <Globe className="size-4" />
                <span>{t("menu_language")}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="min-w-40">
                <DropdownMenuCheckboxItem
                  checked={language === "en"}
                  onCheckedChange={() => setLanguage("en")}
                >
                  English
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={language === "es"}
                  onCheckedChange={() => setLanguage("es")}
                >
                  Español
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Grid */}
            <DropdownMenuItem
              className="flex items-center justify-between gap-x-4"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-x-2">
                <Grid3X3 className="size-4" />
                {t("menu_grid")}
              </div>
              <Switch
                checked={showGrid}
                onCheckedChange={onShowGridChange}
              />
            </DropdownMenuItem>

            {/* Print Safe Zone */}
            <DropdownMenuItem
              className="flex items-center justify-between gap-x-4"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-x-2">
                <Square className="size-4" />
                {t("menu_print_safe_zone")}
              </div>
              <Switch
                checked={showPrintSafeZone}
                onCheckedChange={onShowPrintSafeZoneChange}
              />
            </DropdownMenuItem>

            {/* Auto-save */}
            <DropdownMenuItem
              className="flex items-center justify-between gap-x-4"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-x-2">
                <BsCloudCheck className="size-4" />
                {t("menu_auto_save")}
              </div>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Shortcuts */}
            <DropdownMenuItem
              className="flex items-center gap-x-2"
              onClick={() => toast.info(t("menu_shortcuts_info"))}
            >
              <Keyboard className="size-4" />
              {t("menu_shortcuts")}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Duplicate Template */}
            <DropdownMenuItem
              className="flex items-center gap-x-2"
              onClick={duplicateTemplate}
            >
              <Layers className="size-4" />
              {t("menu_duplicate_template")}
            </DropdownMenuItem>

            {/* Save */}
            <DropdownMenuItem
              className="flex items-center gap-x-2"
              onClick={onSave}
            >
              <Save className="size-4" />
              {t("menu_save")}
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+S</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Open JSON */}
            <DropdownMenuItem
              onClick={() => openFilePicker()}
              className="flex items-center gap-x-2"
            >
              <CiFileOn className="size-4" />
              <div>
                <p>{t("menu_open")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("menu_open_json_desc")}
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Resize Menu */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              {t("menu_resize")}
              <ChevronDown className="size-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-64 max-h-[80vh] overflow-y-auto">
            {/* Template Dimensions */}
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-3">
                <p className="text-sm font-medium">{t("menu_template_dimensions")}</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-12">{t("menu_width")}</span>
                    <Input
                      type="number"
                      value={templateWidth}
                      onChange={(e) => setTemplateWidth(Number(e.target.value))}
                      className="h-8 w-20 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-12">{t("menu_height")}</span>
                    <Input
                      type="number"
                      value={templateHeight}
                      onChange={(e) => setTemplateHeight(Number(e.target.value))}
                      className="h-8 w-20 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">px</span>
                  </div>
                  <Button size="sm" onClick={handleCustomResize} className="h-8 w-full">
                    {t("menu_apply")}
                  </Button>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Preset Sizes */}
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{t("menu_preset_sizes")}</p>
            </DropdownMenuLabel>
            {presetSizes.map((preset) => (
              <DropdownMenuItem
                key={preset.nameKey}
                className="flex items-center justify-between"
                onClick={() => handleResize(preset.width, preset.height)}
              >
                <span className="text-sm">{t(preset.nameKey)}</span>
                <span className="text-xs text-muted-foreground">
                  {preset.width}x{preset.height}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-2" />

        {/* Project Name Input */}
        <div className="flex items-center gap-x-3">
          {!project ? (
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded" />
          ) : (
            <>
              <Input
                defaultValue={project.name}
                onBlur={handleNameChange}
                onKeyDown={handleKeyDown}
                className="h-8 w-[200px] border border-gray-200 hover:border-gray-300 focus:border-blue-500 transition px-2 font-medium"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {templateWidth} x {templateHeight}px
              </span>
            </>
          )}
        </div>

        {/* Save Status - only show when saving or error */}
        {isPending && (
          <div className="flex items-center gap-x-2">
            <Loader className="size-4 animate-spin text-muted-foreground" />
            <div className="text-xs text-muted-foreground">
              {t("status_saving")}
            </div>
          </div>
        )}
        {!isPending && isError && (
          <div className="flex items-center gap-x-2">
            <BsCloudSlash className="size-[20px] text-red-500" />
            <div className="text-xs text-red-500">
              {t("status_failed_save")}
            </div>
          </div>
        )}

        <div className="ml-auto flex items-center gap-x-4">
          {/* Save Button */}
          <Button
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={onSave}
          >
            <Save className="size-4 mr-2" />
            {t("menu_save")}
          </Button>

          {/* Export Menu */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                {t("menu_export")}
                <Download className="size-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-60">
              <DropdownMenuItem
                className="flex items-center gap-x-2"
                onClick={() => editor?.saveJson()}
              >
                <CiFileOn className="size-8" />
                <div>
                  <p>{t("export_json")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("export_json_desc")}
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-2"
                onClick={() => editor?.savePng()}
              >
                <CiFileOn className="size-8" />
                <div>
                  <p>{t("export_png")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("export_png_desc")}
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-2"
                onClick={() => editor?.saveJpg()}
              >
                <CiFileOn className="size-8" />
                <div>
                  <p>{t("export_jpg")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("export_jpg_desc")}
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-2"
                onClick={() => editor?.saveSvg()}
              >
                <CiFileOn className="size-8" />
                <div>
                  <p>{t("export_svg")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("export_svg_desc")}
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <UserButton />
          {!user && (
            <Button size="sm" onClick={() => router.push("/sign-in")}>
              {t("sign_in")}
            </Button>
          )}
        </div>
      </div>

      {/* Description Modal */}
      <Dialog open={isDescriptionModalOpen} onOpenChange={setIsDescriptionModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("menu_set_description")}</DialogTitle>
            <DialogDescription>
              {language === "es"
                ? "Agrega una descripción para tu proyecto."
                : "Add a description for your project."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              placeholder={language === "es" ? "Escribe la descripción aquí..." : "Write the description here..."}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDescriptionModalOpen(false)}>
              {language === "es" ? "Cancelar" : "Cancel"}
            </Button>
            <Button onClick={saveDescription}>
              {language === "es" ? "Guardar" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tags Modal */}
      <Dialog open={isTagsModalOpen} onOpenChange={setIsTagsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("menu_add_tags")}</DialogTitle>
            <DialogDescription>
              {language === "es"
                ? "Agrega etiquetas para organizar tu proyecto."
                : "Add tags to organize your project."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Input para agregar tags */}
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder={language === "es" ? "Escribe una etiqueta..." : "Type a tag..."}
                className="flex-1"
              />
              <Button onClick={addTag} variant="outline" size="sm">
                {language === "es" ? "Agregar" : "Add"}
              </Button>
            </div>
            {/* Tags existentes */}
            <div className="flex flex-wrap gap-2">
              {tempTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {language === "es" ? "Sin etiquetas" : "No tags"}
                </p>
              ) : (
                tempTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTagsModalOpen(false)}>
              {language === "es" ? "Cancelar" : "Cancel"}
            </Button>
            <Button onClick={saveTags}>
              {language === "es" ? "Guardar" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
};
