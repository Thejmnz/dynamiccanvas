"use client";

import { useEffect, useState } from "react";
import { CiFileOn } from "react-icons/ci";
import { useFilePicker } from "use-file-picker";
import {
  ChevronDown,
  Copy,
  Download,
  FileText,
  Globe,
  Grid3X3,
  Info,
  Keyboard,
  Layers,
  Loader,
  Redo2,
  Save,
  Square,
  Tag,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

import { useCreateProject } from "@/features/projects/api/use-create-project";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useUpdateProject } from "@/features/projects/api/use-update-project";
import { UserButton } from "@/features/auth/components/user-button";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { Editor } from "@/features/editor/types";
import { Logo } from "@/features/editor/components/logo";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  id: string;
  initialProject: {
    name: string;
    width: number;
    height: number;
    json: string;
    updatedAt?: Date | string;
    description?: string;
    tags?: string[];
  };
  editor: Editor | undefined;
  showGrid: boolean;
  onShowGridChange: (value: boolean) => void;
  showPrintSafeZone: boolean;
  onShowPrintSafeZoneChange: (value: boolean) => void;
}

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
  initialProject,
  editor,
  showGrid,
  onShowGridChange,
  showPrintSafeZone,
  onShowPrintSafeZoneChange,
}: NavbarProps) => {
  const { t, language, setLanguage } = useLanguage();
  const { data: fetchedProject } = useGetProject(id);
  const project = fetchedProject || initialProject;
  const { mutate: updateProject } = useUpdateProject(id);
  const { mutate: createProject, isPending: isDuplicating } = useCreateProject();

  const [templateWidth, setTemplateWidth] = useState(initialProject.width || 1080);
  const [templateHeight, setTemplateHeight] = useState(initialProject.height || 1350);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [tagsOpen, setTagsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const { openFilePicker } = useFilePicker({
    accept: ".json",
    onFilesSuccessfullySelected: ({ plainFiles }: any) => {
      const file = plainFiles?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = () => editor?.loadJson(reader.result as string);
    },
  });

  useEffect(() => {
    if (!project) return;
    setTemplateWidth(project.width || 1080);
    setTemplateHeight(project.height || 1350);
    setDescription(project.description || "");
    setTags(project.tags || []);
  }, [project]);

  const formatLastSaved = () => {
    if (!project?.updatedAt) return t("menu_not_saved_yet");

    const elapsed = Date.now() - new Date(project.updatedAt).getTime();
    const minutes = Math.max(0, Math.floor(elapsed / 60000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes <= 1) return t("menu_just_now");
    if (hours < 1) return `${minutes} ${t("menu_minutes_ago")}`;
    if (days < 1) return `${hours} ${t("menu_hours_ago")}`;
    if (days === 1) return t("menu_yesterday");
    return `${days} ${t("menu_days_ago")}`;
  };

  const copyTemplateId = async () => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success(t("menu_template_id_copied"));
    } catch {
      toast.error(language === "es" ? "No se pudo copiar" : "Could not copy");
    }
  };

  const resizeCanvas = (width: number, height: number) => {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
      toast.error(language === "es" ? "Ingresa dimensiones válidas" : "Enter valid dimensions");
      return;
    }

    setTemplateWidth(width);
    setTemplateHeight(height);
    editor?.changeSize({ width, height });
    toast.success(`${t("menu_canvas_resized")} ${width} × ${height}px`);
  };

  const addTag = () => {
    const value = tagInput.trim().toLowerCase();
    if (!value || tags.includes(value)) return;
    setTags((current) => [...current, value]);
    setTagInput("");
  };

  const duplicateTemplate = () => {
    if (!project) return;
    createProject({
      name: `${project.name || t("menu_unnamed_template")} (${language === "es" ? "copia" : "copy"})`,
      width: templateWidth,
      height: templateHeight,
      json: project.json,
    });
  };

  return (
    <nav className="flex h-[60px] w-full items-center gap-x-3 border-b-2 border-[#101426] bg-[#f6f5ef] px-3 lg:pl-5">
      <Logo />
      <div className="w-full min-w-0 flex items-center gap-x-1 h-full">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="font-medium">
              {t("menu_file")}
              <ChevronDown className="size-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[320px] p-2">
            <DropdownMenuLabel className="font-normal px-3 py-2">
              <p className="font-semibold truncate">
                {project?.name || t("menu_unnamed_template")}
              </p>
              <p className="text-sm text-muted-foreground">
                {templateWidth} × {templateHeight} px
              </p>
              <p className="text-sm text-muted-foreground">
                {t("menu_saved")} {formatLastSaved()}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="h-10 justify-between"
              onSelect={(event) => event.preventDefault()}
            >
              <span className="flex items-center gap-3">
                <Info className="size-5" />
                {t("menu_template_id")}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2"
                onClick={(event) => {
                  event.stopPropagation();
                  void copyTemplateId();
                }}
              >
                <Copy className="size-4 mr-1.5" />
                {language === "es" ? "Copiar" : "Copy"}
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem className="h-10 gap-3" onClick={() => setDescriptionOpen(true)}>
              <FileText className="size-5" />
              {t("menu_set_description")}
            </DropdownMenuItem>
            <DropdownMenuItem className="h-10 gap-3" onClick={() => setTagsOpen(true)}>
              <Tag className="size-5" />
              {t("menu_add_tags")}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="h-10 gap-3">
                <Globe className="size-5" />
                {t("menu_language")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={language === "es"}
                  onCheckedChange={() => setLanguage("es")}
                >
                  Español
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={language === "en"}
                  onCheckedChange={() => setLanguage("en")}
                >
                  English
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="h-11 justify-between"
              onSelect={(event) => event.preventDefault()}
            >
              <span className="flex items-center gap-3">
                <Grid3X3 className="size-5" />
                {t("menu_grid")}
              </span>
              <Switch checked={showGrid} onCheckedChange={onShowGridChange} />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="h-11 justify-between"
              onSelect={(event) => event.preventDefault()}
            >
              <span className="flex items-center gap-3">
                <Square className="size-5" />
                {t("menu_print_safe_zone")}
              </span>
              <Switch checked={showPrintSafeZone} onCheckedChange={onShowPrintSafeZoneChange} />
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="h-10 gap-3"
              onClick={() => setShortcutsOpen(true)}
            >
              <Keyboard className="size-5" />
              {t("menu_shortcuts")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="h-10 gap-3"
              disabled={isDuplicating || !project}
              onClick={duplicateTemplate}
            >
              {isDuplicating ? <Loader className="size-5 animate-spin" /> : <Layers className="size-5" />}
              {isDuplicating ? t("menu_duplicating") : t("menu_duplicate_template")}
            </DropdownMenuItem>
            <DropdownMenuItem className="h-10 gap-3" onClick={() => editor?.save()}>
              <Save className="size-5" />
              {t("menu_save")}
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+S</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3 py-2" onClick={() => openFilePicker()}>
              <CiFileOn className="size-5" />
              <div>
                <p>{t("menu_open")}</p>
                <p className="text-xs text-muted-foreground">{t("menu_open_json_desc")}</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="font-medium">
              {t("menu_resize")}
              <ChevronDown className="size-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[410px] max-w-[calc(100vw-16px)] max-h-[80vh] overflow-y-auto p-0"
          >
            <DropdownMenuLabel className="font-normal p-5">
              <p className="text-lg font-semibold mb-4">{t("menu_template_dimensions")}</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-muted-foreground">
                  <span className="w-20">{t("menu_width")}</span>
                  <Input
                    type="number"
                    min={1}
                    value={templateWidth}
                    onChange={(event) => setTemplateWidth(Number(event.target.value))}
                    className="w-32"
                  />
                  <span>px</span>
                </label>
                <label className="flex items-center gap-3 text-muted-foreground">
                  <span className="w-20">{t("menu_height")}</span>
                  <Input
                    type="number"
                    min={1}
                    value={templateHeight}
                    onChange={(event) => setTemplateHeight(Number(event.target.value))}
                    className="w-32"
                  />
                  <span>px</span>
                </label>
                <Button
                  className="w-full text-base"
                  onClick={() => resizeCanvas(Number(templateWidth), Number(templateHeight))}
                >
                  {t("menu_apply")}
                </Button>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0" />
            <DropdownMenuLabel className="px-5 pt-4 pb-2 text-lg">
              {t("menu_preset_sizes")}
            </DropdownMenuLabel>
            <div className="px-2 pb-3">
              {presetSizes.map((preset) => (
                <DropdownMenuItem
                  key={preset.nameKey}
                  className="h-11 px-3 justify-between text-base"
                  onClick={() => resizeCanvas(preset.width, preset.height)}
                >
                  <span>{t(preset.nameKey)}</span>
                  <span className="text-muted-foreground">
                    {preset.width}×{preset.height}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-2" />
        <div className="flex min-w-0 items-center gap-2">
          <Input
            key={project.name}
            defaultValue={project.name}
            aria-label={language === "es" ? "Nombre del proyecto" : "Project name"}
            className="h-8 w-[200px] min-w-[140px] rounded-lg font-semibold"
            onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
            onBlur={(event) => {
              const name = event.currentTarget.value.trim();
              if (name && name !== project.name) updateProject({ name });
            }}
          />
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {templateWidth} × {templateHeight}px
          </span>
        </div>

        <div className="ml-auto flex items-center gap-x-2">
          <Hint label={language === "es" ? "Deshacer" : "Undo"} side="bottom" sideOffset={10}>
            <Button disabled={!editor?.canUndo()} variant="ghost" size="icon" onClick={() => editor?.onUndo()}>
              <Undo2 className="size-4" />
            </Button>
          </Hint>
          <Hint label={language === "es" ? "Rehacer" : "Redo"} side="bottom" sideOffset={10}>
            <Button disabled={!editor?.canRedo()} variant="ghost" size="icon" onClick={() => editor?.onRedo()}>
              <Redo2 className="size-4" />
            </Button>
          </Hint>
          <Button size="sm" disabled={!editor} onClick={() => editor?.save()}>
            <Save className="size-4 mr-2" />
            {t("menu_save")}
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                {t("menu_export")}
                <Download className="size-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-60">
              {[
                ["JSON", () => editor?.saveJson(), t("export_json_desc")],
                ["PNG", () => editor?.savePng(), t("export_png_desc")],
                ["JPG", () => editor?.saveJpg(), t("export_jpg_desc")],
                ["SVG", () => editor?.saveSvg(), t("export_svg_desc")],
              ].map(([label, action, description]) => (
                <DropdownMenuItem
                  key={label as string}
                  className="gap-3 py-2"
                  onClick={action as () => void}
                >
                  <CiFileOn className="size-5" />
                  <div>
                    <p>{label as string}</p>
                    <p className="text-xs text-muted-foreground">{description as string}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <UserButton />
        </div>
      </div>

      <Dialog open={descriptionOpen} onOpenChange={setDescriptionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("menu_set_description")}</DialogTitle>
            <DialogDescription>
              {language === "es" ? "Agrega una descripción para tu proyecto." : "Add a description to your project."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            className="resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDescriptionOpen(false)}>
              {language === "es" ? "Cancelar" : "Cancel"}
            </Button>
            <Button
              onClick={() => {
                updateProject({ description });
                setDescriptionOpen(false);
              }}
            >
              {t("menu_save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{language === "es" ? "Atajos del editor" : "Editor shortcuts"}</DialogTitle>
            <DialogDescription>
              {language === "es"
                ? "Usa Ctrl en Windows o Linux y ⌘ en macOS."
                : "Use Ctrl on Windows or Linux and ⌘ on macOS."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm">
            {[
              [language === "es" ? "Deshacer" : "Undo", "Ctrl / ⌘ + Z"],
              [language === "es" ? "Rehacer" : "Redo", "Ctrl / ⌘ + Shift + Z"],
              [language === "es" ? "Copiar" : "Copy", "Ctrl / ⌘ + C"],
              [language === "es" ? "Cortar" : "Cut", "Ctrl / ⌘ + X"],
              [language === "es" ? "Pegar" : "Paste", "Ctrl / ⌘ + V"],
              [language === "es" ? "Duplicar" : "Duplicate", "Ctrl / ⌘ + D"],
              [language === "es" ? "Seleccionar todo" : "Select all", "Ctrl / ⌘ + A"],
              [language === "es" ? "Guardar" : "Save", "Ctrl / ⌘ + S"],
              [language === "es" ? "Eliminar" : "Delete", "Delete / Backspace"],
              [language === "es" ? "Deseleccionar" : "Deselect", "Esc"],
              [language === "es" ? "Mover 1 px" : "Move 1 px", "← ↑ ↓ →"],
              [language === "es" ? "Mover 10 px" : "Move 10 px", "Shift + ← ↑ ↓ →"],
              [language === "es" ? "Enviar atrás" : "Send backward", "Ctrl / ⌘ + ["],
              [language === "es" ? "Traer adelante" : "Bring forward", "Ctrl / ⌘ + ]"],
            ].map(([label, shortcut]) => (
              <div key={label} className="contents">
                <span className="py-2 text-slate-600">{label}</span>
                <kbd className="justify-self-end rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-[11px] font-semibold text-slate-700 shadow-sm">
                  {shortcut}
                </kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={tagsOpen} onOpenChange={setTagsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("menu_add_tags")}</DialogTitle>
            <DialogDescription>
              {language === "es" ? "Agrega etiquetas para organizar tu proyecto." : "Add tags to organize your project."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag();
                }
              }}
            />
            <Button variant="outline" onClick={addTag}>
              {language === "es" ? "Agregar" : "Add"}
            </Button>
          </div>
          <div className="flex min-h-10 flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                onClick={() => setTags((current) => current.filter((item) => item !== tag))}
              >
                {tag} ×
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagsOpen(false)}>
              {language === "es" ? "Cancelar" : "Cancel"}
            </Button>
            <Button
              onClick={() => {
                updateProject({ tags });
                setTagsOpen(false);
              }}
            >
              {t("menu_save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
};
