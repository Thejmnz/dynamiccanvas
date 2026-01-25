"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Share2, Briefcase, Printer, Grid as GridIcon } from "lucide-react";

import { useCreateProject } from "@/features/projects/api/use-create-project";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = "social" | "business" | "print" | "custom" | null;

interface Template {
  name: string;
  width: number;
  height: number;
}

import { useLanguage } from "@/lib/contexts/LanguageContext";

export const TemplatesSection = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const mutation = useCreateProject();
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [customWidth, setCustomWidth] = useState("1920");
  const [customHeight, setCustomHeight] = useState("1080");

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
          setSelectedCategory(null);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{t("create_template")}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(categories).map(([key, category]) => {
          const Icon = category.icon;
          return (
            <Card
              key={key}
              className="p-6 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => setSelectedCategory(key as Category)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  {category.popular && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                      {t("popular")}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{category.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {category.sizes.length} {category.sizes.length === 1 ? t("size") : t("sizes")}
                </p>
              </div>
            </Card>
          );
        })}

        {/* Custom Size Card */}
        <Card
          className="p-6 border-2 border-dashed hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
          onClick={() => setSelectedCategory("custom")}
        >
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
              <GridIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h4 className="font-semibold">{t("custom_size")}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {t("define_dimensions")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{t("width")} × {t("height")}</p>
          </div>
        </Card>
      </div>

      {/* Category Dialogs */}
      {Object.entries(categories).map(([key, category]) => (
        <Dialog
          key={key}
          open={selectedCategory === key}
          onOpenChange={() => setSelectedCategory(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <category.icon className="size-5" />
                {category.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {t("choose_preset")}
              </p>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 py-4">
              {category.sizes.map((template) => (
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
          </DialogContent>
        </Dialog>
      ))}

      {/* Custom Size Dialog */}
      <Dialog open={selectedCategory === "custom"} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GridIcon className="size-5" />
              {t("custom_size")}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t("enter_dimensions")}
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                {t("cancel")}
              </Button>
              <Button onClick={createCustomSize} disabled={mutation.isPending}>
                {t("create_template_button")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
