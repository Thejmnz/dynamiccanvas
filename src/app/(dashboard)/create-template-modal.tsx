"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileText, Share2, Briefcase, Printer, Grid as GridIcon, Plus, FileUp, Image, Sparkles, ExternalLink } from "lucide-react";

import { useCreateProject } from "@/features/projects/api/use-create-project";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFilePicker } from "use-file-picker";

type Category = "social" | "business" | "print" | "custom" | null;

interface Template {
  name: string;
  width: number;
  height: number;
}

import { useLanguage } from "@/lib/contexts/LanguageContext";

export const CreateTemplateModal = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const mutation = useCreateProject();
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [customWidth, setCustomWidth] = useState("1920");
  const [customHeight, setCustomHeight] = useState("1080");
  const [isOpen, setIsOpen] = useState(false);

  const { openFilePicker } = useFilePicker({
    accept: ".json",
    onFilesSuccessfullySelected: ({ plainFiles }: any) => {
      if (plainFiles && plainFiles.length > 0) {
        const file = plainFiles[0];
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = () => {
          try {
            const jsonContent = reader.result as string;
            const parsed = JSON.parse(jsonContent);

            // Get dimensions from JSON or use defaults
            const width = parsed.workspace?.width || 1080;
            const height = parsed.workspace?.height || 1350;

            mutation.mutate(
              {
                name: file.name.replace('.json', ''),
                json: jsonContent,
                width,
                height,
              },
              {
                onSuccess: (data) => {
                  if (data?.id) {
                    router.push(`/editor/${data.id}`);
                  }
                  setIsOpen(false);
                  setSelectedCategory(null);
                },
              }
            );
          } catch (e) {
            console.error("Error parsing JSON file:", e);
          }
        };
      }
    },
  });

  const categories = {
    social: {
      icon: Share2,
      title: t("social_media"),
      description: "Instagram, Facebook, X",
      sizes: [
        { name: "Story", width: 1080, height: 1920 },
        { name: "Square Post", width: 1080, height: 1080 },
        { name: "Portrait Post", width: 1080, height: 1350 },
        { name: "Landscape Post", width: 1080, height: 608 },
        { name: "Banner", width: 1500, height: 500 },
        { name: "Post Image", width: 1600, height: 900 },
      ],
      popular: true,
    },
    business: {
      icon: Briefcase,
      title: t("business_marketing"),
      description: "LinkedIn, banners",
      sizes: [
        { name: "Post", width: 1200, height: 628 },
        { name: "Rectangle", width: 900, height: 750 },
        { name: "Billboard", width: 970, height: 250 },
      ],
      popular: false,
    },
    print: {
      icon: Printer,
      title: t("print_documents"),
      description: "A4, Letter, Legal",
      sizes: [
        { name: "A4", width: 2480, height: 3508 },
        { name: "US Letter", width: 2550, height: 3300 },
        { name: "US Legal", width: 2550, height: 4200 },
      ],
      popular: false,
    },
  };

  const createFromTemplate = (template: Template) => {
    mutation.mutate(
      {
        name: `${template.name} project`,
        json: "",
        width: template.width,
        height: template.height,
      },
      {
        onSuccess: (data) => {
          if (data?.id) {
            router.push(`/editor/${data.id}`);
          }
          setIsOpen(false);
          setSelectedCategory(null);
        },
      }
    );
  };

  const createCustomSize = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);

    if (isNaN(width) || isNaN(height) || width < 1 || height < 1) {
      return;
    }

    mutation.mutate(
      {
        name: "Custom project",
        json: "",
        width,
        height,
      },
      {
        onSuccess: (data) => {
          if (data?.id) {
            router.push(`/editor/${data.id}`);
          }
          setIsOpen(false);
          setSelectedCategory(null);
        },
      }
    );
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setSelectedCategory(null);
    }}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center justify-center rounded-xl border-2 border-[#c9ff5a] bg-[#c9ff5a] px-3 py-3 text-[#101426] transition hover:-translate-y-0.5 hover:bg-white">
          <Plus className="size-4 mr-2 stroke-2" />
          <span className="text-sm font-medium">
            {t("create_template")}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl rounded-[24px] border-2 border-[#101426] bg-[#f6f5ef] shadow-[10px_10px_0_#101426]">
        {!selectedCategory ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("create_template")}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {t("choose_category")}
              </p>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
              {Object.entries(categories).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as Category)}
                    className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-[#101426]/15 bg-white p-5 transition-all hover:-translate-y-1 hover:border-[#5b35d5] hover:shadow-[5px_5px_0_#d9ccff]"
                  >
                    <div className="rounded-xl bg-[#e9e5ff] p-3 transition-colors group-hover:bg-[#c9ff5a]">
                      <Icon className="h-6 w-6 text-[#5b35d5]" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">{category.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                    {category.popular && (
                      <span className="rounded-full bg-[#c9ff5a] px-2 py-0.5 text-xs font-bold text-[#101426]">
                        {t("popular")}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Custom Size */}
              <button
                onClick={() => setSelectedCategory("custom")}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed hover:border-blue-500 hover:bg-gray-50 transition-all group"
              >
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <GridIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{t("custom_size")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("define_dimensions")}
                  </p>
                </div>
              </button>

              {/* Export from Canva - Soon */}
              <button
                disabled
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed opacity-60 cursor-not-allowed transition-all group"
              >
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ExternalLink className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{t("export_canva")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("coming_soon")}
                  </p>
                </div>
              </button>

              {/* Export from Image - Soon */}
              <button
                disabled
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed opacity-60 cursor-not-allowed transition-all group"
              >
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Image className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{t("export_image")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("coming_soon")}
                  </p>
                </div>
              </button>

              {/* AI Generator - Soon */}
              <button
                disabled
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed opacity-60 cursor-not-allowed transition-all group"
              >
                <div className="p-3 bg-pink-100 rounded-lg">
                  <Sparkles className="h-6 w-6 text-pink-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{t("ai_generator")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("coming_soon")}
                  </p>
                </div>
              </button>

              {/* Open JSON */}
              <button
                onClick={() => openFilePicker()}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed hover:border-blue-500 hover:bg-green-50 transition-all group"
              >
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <FileUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{t("menu_open")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("menu_open_json_desc")}
                  </p>
                </div>
              </button>
            </div>
          </>
        ) : selectedCategory === "custom" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <button onClick={handleBack} className="hover:bg-gray-100 p-1 rounded">
                  <GridIcon className="size-4" />
                </button>
                {t("custom_size")}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {t("enter_dimensions")}
              </p>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("width")} (px)</label>
                  <Input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    placeholder="1920"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("height")} (px)</label>
                  <Input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    placeholder="1080"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={handleBack}>
                  {t("back")}
                </Button>
                <Button onClick={createCustomSize} disabled={mutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                  {mutation.isPending ? t("creating") : t("create_template_button")}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <button onClick={handleBack} className="hover:bg-gray-100 p-1 rounded">
                  {(() => {
                    const Icon = categories[selectedCategory as keyof typeof categories].icon;
                    return <Icon className="size-4" />;
                  })()}
                </button>
                {categories[selectedCategory as keyof typeof categories].title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {t("choose_preset")}
              </p>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 py-4">
              {categories[selectedCategory as keyof typeof categories].sizes.map((template) => (
                <button
                  key={template.name}
                  onClick={() => createFromTemplate(template)}
                  disabled={mutation.isPending}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="border-2 border-gray-300 rounded w-16 h-20" />
                  <div className="text-center">
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {template.width} x {template.height} px
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-start">
              <Button variant="outline" onClick={handleBack}>
                {t("back")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
