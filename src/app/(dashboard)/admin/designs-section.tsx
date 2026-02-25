"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileJson, Trash2, Eye, Download, Plus } from "lucide-react";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Design {
  id: string;
  name: string;
  json: string;
  width: number;
  height: number;
  createdAt: string;
}

export const DesignsSection = () => {
  const { t } = useLanguage();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/designs");
      if (res.ok) {
        const data = await res.json();
        setDesigns(data);
      }
    } catch (error) {
      console.error("Error fetching designs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedDesigns: Design[] = [];

    for (const file of Array.from(files)) {
      if (!file.name.endsWith('.json')) {
        toast.error(`${file.name} is not a JSON file`);
        continue;
      }

      try {
        const content = await file.text();
        const parsed = JSON.parse(content);

        const designData = {
          name: file.name.replace('.json', ''),
          json: content,
          width: parsed.workspace?.width || 1080,
          height: parsed.workspace?.height || 1350,
        };

        const res = await fetch("/api/admin/designs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(designData),
        });

        if (res.ok) {
          const newDesign = await res.json();
          uploadedDesigns.push(newDesign);
          toast.success(`Uploaded: ${file.name}`);
        } else {
          toast.error(`Failed to upload: ${file.name}`);
        }
      } catch (error) {
        toast.error(`Error processing: ${file.name}`);
      }
    }

    if (uploadedDesigns.length > 0) {
      setDesigns(prev => [...uploadedDesigns, ...prev]);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/designs?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDesigns(prev => prev.filter(d => d.id !== id));
        toast.success(t("design_deleted"));
      } else {
        toast.error(t("failed_delete_design"));
      }
    } catch (error) {
      toast.error(t("failed_delete_design"));
    }
  };

  const handleDownload = (design: Design) => {
    const blob = new Blob([design.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${design.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreview = (design: Design) => {
    // Open in new tab with a preview
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>${design.name} - Preview</title>
            <style>
              body { margin: 0; padding: 20px; font-family: sans-serif; background: #f5f5f5; }
              .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
              h1 { margin-bottom: 10px; }
              .info { color: #666; margin-bottom: 20px; }
              pre { background: #f8f8f8; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${design.name}</h1>
              <div class="info">${design.width} x ${design.height} px</div>
              <pre>${JSON.stringify(JSON.parse(design.json), null, 2)}</pre>
            </div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("designs")}</h2>
          <p className="text-gray-600 mt-1">{t("designs_desc")}</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="design-upload"
          />
          <label htmlFor="design-upload">
            <Button
              asChild
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? t("uploading") : t("upload_designs")}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {designs.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <FileJson className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t("no_designs_yet")}</h3>
          <p className="text-gray-600 mb-4">{t("upload_first_design")}</p>
          <label htmlFor="design-upload">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t("add_design")}
              </span>
            </Button>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {designs.map((design) => (
            <div
              key={design.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <FileJson className="w-16 h-16 text-blue-300" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{design.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {design.width} x {design.height} px
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreview(design)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t("preview")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(design)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(design.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
