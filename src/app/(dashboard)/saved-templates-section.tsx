"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader, AlertTriangle, MoreVertical, Copy, ExternalLink } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { useCreateProject } from "@/features/projects/api/use-create-project";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Template {
    id: string;
    name: string;
    width: number;
    height: number;
    thumbnailUrl: string | null;
    created_at: string;
}

export const SavedTemplatesSection = () => {
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const createProjectMutation = useCreateProject();

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError(true);
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('dynamic_canvas_templates')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setTemplates(data || []);
        } catch (err) {
            console.error("Error loading templates:", err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const copyTemplateId = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("Template ID copied to clipboard");
    };

    const openInEditor = (template: Template) => {
        // Create a new project from this template
        createProjectMutation.mutate(
            {
                name: `${template.name} (Copy)`,
                json: "", // Will load from template
                width: template.width,
                height: template.height,
            },
            {
                onSuccess: (data) => {
                    if (data?.id) {
                        router.push(`/editor/${data.id}`);
                    }
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">My Templates</h3>
                <div className="flex items-center justify-center h-32">
                    <Loader className="size-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">My Templates</h3>
                <div className="flex flex-col gap-y-4 items-center justify-center h-32">
                    <AlertTriangle className="size-6 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">Failed to load templates</p>
                </div>
            </div>
        );
    }

    if (templates.length === 0) {
        return (
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">My Templates</h3>
                <div className="flex flex-col gap-y-4 items-center justify-center h-32 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground text-sm">
                        No templates yet. Mark a project as template in the API Integration page!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">My Templates</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {templates.map((template) => (
                    <Card key={template.id} className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all">
                        {/* Thumbnail */}
                        <div className="aspect-[3/4] bg-gray-100 relative">
                            {template.thumbnailUrl ? (
                                <img
                                    src={template.thumbnailUrl}
                                    alt={template.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-xs">No preview</span>
                                </div>
                            )}

                            {/* Menu button */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="secondary" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => copyTemplateId(template.id)}>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy ID
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-3 space-y-2">
                            <div>
                                <p className="font-medium text-sm truncate">{template.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {template.width} x {template.height} px
                                </p>
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => openInEditor(template)}
                                disabled={createProjectMutation.isPending}
                            >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Open in Editor
                            </Button>

                            {/* Template ID */}
                            <div className="pt-1 border-t">
                                <p className="text-xs text-muted-foreground font-mono truncate">
                                    {template.id.substring(0, 8)}...
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
