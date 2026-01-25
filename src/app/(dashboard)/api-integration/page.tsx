"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // Using sonner instead of use-toast
import { Copy, ExternalLink, KeyRound, BookOpen, Lightbulb, Code, Braces, FileJson, Puzzle, RefreshCw, Play, Loader2 } from "lucide-react";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// --- Types Definition (Inline for simplicity during migration) ---

export interface AnyCanvasElement {
    id: string;
    type: string;
    x: number;
    y: number;
    [key: string]: any;
}

export interface TextElement extends AnyCanvasElement {
    type: 'text';
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
}

export interface ImageElement extends AnyCanvasElement {
    type: 'image';
    src: string;
    width: number;
    height: number;
}

interface Template {
    id: string;
    name: string;
    width: number;
    height: number;
    backgroundColor: string;
    elements: TemplateElement[];
}

interface TemplateElement {
    id: string;
    type: 'text' | 'image';
    x: number;
    y: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    text?: string;
    textAlign?: string;
    zIndex?: number;
    width?: number;
    height?: number;
    lineHeight?: number;
    src?: string;  // For image elements
    [key: string]: any;
}

interface ApiResponse {
    type?: 'success' | 'error';
    status?: number;
    imageUrl?: string;
    width?: number;
    height?: number;
    error?: string;
    data?: any;
    details?: {
        type?: string;
        statusCode?: number;
        [key: string]: any;
    };
}


const ABSOLUTE_API_ENDPOINT = "/api/render";
const generateExampleApiKey = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `key-${Math.random().toString(36).substring(2, 10)}`;

interface CodeSnippetProps {
    language: string;
    code: string;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ language, code }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(code).then(() => {
            toast.success("Copied!", { description: `${language} code snippet copied to clipboard.` });
        }).catch(err => {
            toast.error("Copy Failed", { description: "Could not copy to clipboard." });
        });
    };

    return (
        <div className="relative group">
            <pre className="bg-slate-900 text-slate-300 p-4 rounded-md overflow-x-auto text-sm">
                <code>{code.trim()}</code>
            </pre>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 text-gray-400 hover:text-white opacity-50 group-hover:opacity-100 transition-opacity"
                onClick={copyToClipboard}
                title={`Copy ${language} code`}
            >
                <Copy className="h-4 w-4" />
            </Button>
        </div>
    );
};

// ... Snippet generators (kept same logic) ...
const getJsSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const defaultLayers = {
        "text-example": { "text": "Provide text here", "color": "#FF0000" },
        "image-example": { "image_url": "https://placehold.co/200x300.png" }
    };
    const finalLayers = layers && Object.keys(layers).length > 0 ? layers : defaultLayers;

    return JSON.stringify({
        templateId: templateId || 'YOUR_TEMPLATE_ID',
        layers: finalLayers
    }, null, 2);
};

const getPythonSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const defaultLayers = {
        "text-example": { "text": "Hello from Python!", "color": "#00FF00" },
        "image-example": { "image_url": "https://placehold.co/200x300.png" }
    };
    const finalLayers = layers && Object.keys(layers).length > 0 ? layers : defaultLayers;

    let code = '';
    code += '# Python Request Example\n';
    code += 'import requests\nimport json\n\n';
    code += `api_url = "${absoluteApiEndpoint}"\n`;
    code += `headers = {\n    "Authorization": "Bearer ${apiKey}",\n    "Content-Type": "application/json"\n}\n\n`;
    code += 'payload = {\n';
    code += `    "templateId": "${templateId || 'YOUR_TEMPLATE_ID'}",\n`;
    code += `    "layers": ${JSON.stringify(finalLayers, null, 4).replace(/\n/g, '\n    ')}\n`;
    code += '}\n\n';
    code += "response = requests.post(api_url, headers=headers, json=payload)\n";
    code += "print(response.json())";
    return code;
};

const getJavaSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    // Simplified for brevity in this migration
    return "// Java snippet placeholder";
};

const getPhpSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    // Simplified for brevity in this migration
    return "// PHP snippet placeholder";
};


import { useLanguage } from "@/lib/contexts/LanguageContext";

// ... (code above)

function ApiIntegrationContent() {
    const { t } = useLanguage(); // Import translator
    const searchParams = useSearchParams();
    const templateIdParam = searchParams.get('templateIdForApi');
    const [exampleApiKey, setExampleApiKey] = useState<string>("");
    const [isLoadingApiKey, setIsLoadingApiKey] = useState(true);

    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [layersDataForSnippets, setLayersDataForSnippets] = useState<Record<string, TemplateElement>>({});
    const [isTestingApi, setIsTestingApi] = useState(false);
    const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
    const [isLoadingTemplateData, setIsLoadingTemplateData] = useState(false);
    const [templateIdForApi, setTemplateIdForApi] = useState<string | null>(null);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [requestBody, setRequestBody] = useState("");

    // Sync request body with selection
    useEffect(() => {
        if (selectedTemplate) {
            setRequestBody(JSON.stringify({
                templateId: selectedTemplate.id,
                layers: layersDataForSnippets
            }, null, 2));
        }
    }, [selectedTemplate, layersDataForSnippets]);

    // Initialize API key and load all templates
    useEffect(() => {
        setIsLoadingTemplateData(true);
        setIsLoadingTemplates(true);

        const initializeData = async () => {
            try {
                // Initialize API key
                const { data: userData } = await supabase.auth.getUser();
                if (!userData?.user) {
                    setIsLoadingTemplateData(false);
                    setIsLoadingTemplates(false);
                    setIsLoadingApiKey(false);
                    return;
                }
                const userId = userData.user.id;

                const { data: apiKeyData, error: apiKeyError } = await supabase
                    .from('user_api_keys')
                    .select('api_key')
                    .eq('user_id', userId)
                    .single();

                if (apiKeyError && apiKeyError.code !== 'PGRST116') {
                    // Real error (not just not found)
                    console.error("Error fetching API Key:", apiKeyError);
                    toast.error("Could not load API Key. Check database permissions.");
                }

                if (apiKeyData?.api_key) {
                    setExampleApiKey(apiKeyData.api_key);
                } else {
                    // Create new key ONLY if not found
                    const newKey = generateExampleApiKey();
                    setExampleApiKey(newKey);
                    const { error: upsertError } = await supabase
                        .from('user_api_keys')
                        .upsert({ user_id: userId, api_key: newKey }, { onConflict: 'user_id' });

                    if (upsertError) {
                        console.error("Error saving API Key:", upsertError);
                        toast.error("Failed to save new API Key");
                    }
                }
                setIsLoadingApiKey(false);


                // Fetch templates
                const { data: templatesData, error: templatesError } = await supabase
                    .from('templates')
                    .select('*')
                    .eq('user_id', userId)
                    .order('lastModified', { ascending: false });

                if (templatesData && templatesData.length > 0) {
                    // Mapping Supabase data to our Template interface
                    // Note: You might need to adjust this depending on your actual DB schema structure
                    // This assumes the DB structure matches what we expect
                    const typedTemplates = templatesData.map(t => ({
                        id: t.id,
                        name: t.name || 'Untitled',
                        width: t.width || 800,
                        height: t.height || 600,
                        backgroundColor: t.background_color || '#fff', // Adjust field name if snake_case in DB
                        elements: t.elements || [] // Assumes elements are stored as JSONB
                    } as unknown as Template));

                    setTemplates(typedTemplates);

                    // Select template
                    let templateToSelect = typedTemplates[0];
                    if (templateIdParam) {
                        const foundTemplate = typedTemplates.find(t => t.id === templateIdParam);
                        if (foundTemplate) templateToSelect = foundTemplate;
                    }

                    setSelectedTemplate(templateToSelect);
                    setTemplateIdForApi(templateToSelect.id);

                    if (Array.isArray(templateToSelect.elements)) {
                        const initialLayers = templateToSelect.elements.reduce((acc, el) => {
                            acc[el.id] = { ...el, text: el.text || '', src: el.src || '' };
                            return acc;
                        }, {} as Record<string, TemplateElement>);
                        setLayersDataForSnippets(initialLayers);
                    }

                } else {
                    // Fallback for no templates
                    const sampleTemplate: Template = {
                        id: 'sample-id',
                        name: 'Sample Template',
                        width: 800,
                        height: 600,
                        backgroundColor: '#ffffff',
                        elements: []
                    };
                    setTemplates([sampleTemplate]);
                    setSelectedTemplate(sampleTemplate);
                }

            } catch (error) {
                console.error('Error initializing data:', error);
                toast.error("Error", { description: "Could not initialize data" });
            } finally {
                setIsLoadingTemplateData(false);
                setIsLoadingTemplates(false);
            }
        };
        initializeData();
    }, [templateIdParam]);

    const copyExampleApiKey = () => {
        if (!exampleApiKey) return;
        navigator.clipboard.writeText(exampleApiKey).then(() => {
            toast.success(t("api_key_copied"));
        }).catch(err => {
            toast.error(t("copy_failed"));
        });
    };

    const handleTemplateSelect = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSelectedTemplate(template);
            setTemplateIdForApi(template.id);
            if (Array.isArray(template.elements)) {
                const updatedLayers = template.elements.reduce((acc, el) => {
                    acc[el.id] = { ...el, text: el.text || '', src: el.src || '' };
                    return acc;
                }, {} as Record<string, TemplateElement>);
                setLayersDataForSnippets(updatedLayers);
            }
        }
    };

    // Generate snippets
    const jsCode = useMemo(() => getJsSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);
    const [editableJsPayload, setEditableJsPayload] = useState<string>(() => jsCode);
    useEffect(() => { setEditableJsPayload(jsCode); }, [jsCode]);
    const pythonCode = useMemo(() => getPythonSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);

    const handleTestApi = async () => {
        if (!selectedTemplate?.id) {
            toast.error("Please select a template first");
            return;
        }

        setIsTestingApi(true);
        setApiResponse(null);

        try {
            let payload;
            try {
                payload = JSON.parse(requestBody);
            } catch (e) {
                toast.error("Invalid JSON in Playground");
                return;
            }

            const response = await fetch(ABSOLUTE_API_ENDPOINT, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${exampleApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            setApiResponse({
                status: response.status,
                data: data
            });

            if (response.ok) {
                toast.success(t("api_success"));
            } else {
                toast.error(t("api_failed"), { description: data.error || "Unknown error" });
            }

        } catch (error: any) {
            console.error("Test API Error:", error);
            setApiResponse({
                status: 500,
                error: error.message || "Network error"
            });
            toast.error("Network Error");
        } finally {
            setIsTestingApi(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">{t("api_integration_title")}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    {/* Template Selector */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Puzzle className="mr-2 h-5 w-5" /> {t("select_template")}</CardTitle>
                            <CardDescription>{t("choose_template_desc")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedTemplate?.id || ''} onValueChange={handleTemplateSelect} disabled={isLoadingTemplates}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("select_a_template_placeholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><KeyRound className="mr-2 h-5 w-5" /> {t("api_key")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    value={isLoadingApiKey ? "Loading key..." : exampleApiKey}
                                    readOnly
                                    className="font-mono text-sm"
                                    disabled={isLoadingApiKey}
                                />
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={copyExampleApiKey}
                                    disabled={isLoadingApiKey}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Code className="mr-2 h-5 w-5" /> {t("api_endpoint")}</CardTitle>
                            <CardDescription>{t("api_endpoint_desc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium mb-1">{t("endpoint_url")}</p>
                                <div className="flex gap-2">
                                    <Input
                                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/render`}
                                        readOnly
                                        className="font-mono text-xs"
                                    />
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => {
                                            const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/render`;
                                            navigator.clipboard.writeText(url);
                                            toast.success(t("endpoint_url_copied"));
                                        }}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleTestApi}
                                disabled={isTestingApi || !selectedTemplate}
                            >
                                {isTestingApi ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("testing")}
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" /> {t("test_endpoint")}
                                    </>
                                )}
                            </Button>

                            {apiResponse && (
                                <div className="space-y-4">
                                    {apiResponse.data?.imageUrl && (
                                        <div className="border rounded-md overflow-hidden bg-gray-100 flex flex-col items-center">
                                            <div className="w-full bg-white p-2 border-b text-center text-xs text-muted-foreground font-medium">
                                                {t("generated_result")}
                                            </div>
                                            <img
                                                src={apiResponse.data.imageUrl}
                                                alt="Rendered Result"
                                                className="max-w-full h-auto object-contain max-h-[400px] shadow-sm m-4"
                                            />
                                            <div className="w-full p-2 bg-white text-xs text-center border-t">
                                                <a
                                                    href={apiResponse.data.imageUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-blue-600 hover:underline"
                                                >
                                                    <ExternalLink className="mr-1 h-3 w-3" />
                                                    {t("open_original_image")}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <div className={`text-xs p-3 rounded-md overflow-x-auto ${apiResponse.status === 200 ? 'bg-green-50 text-green-900 border border-green-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
                                        <p className="font-bold mb-1">{t("status")}: {apiResponse.status}</p>
                                        <pre>{JSON.stringify(apiResponse.data || { error: apiResponse.error }, null, 2)}</pre>
                                    </div>
                                </div>
                            )}

                            <div className="text-xs space-y-1 text-muted-foreground pt-2 border-t">
                                <p>✅ <strong>{t("auth_validated")}</strong></p>
                                <p>✅ <strong>{t("method_post")}</strong></p>
                                <p>✅ <strong>{t("response_processed")}</strong></p>
                                <p>⏳ <strong>{t("image_rendering_soon")}</strong></p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center text-blue-900">
                                <Lightbulb className="mr-2 h-5 w-5" />
                                {t("how_it_works")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-blue-800 space-y-2">
                            <p><strong>1.</strong> {t("step_1_desc")}</p>
                            <p><strong>2.</strong> {t("step_2_desc")}</p>
                            <p><strong>3.</strong> {t("step_3_desc")}</p>
                            <p><strong>4.</strong> {t("step_4_desc")}</p>
                            <p><strong>5.</strong> {t("step_5_desc")}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>{t("code_snippets")}</CardTitle></CardHeader>
                        <CardContent>
                            <Tabs defaultValue="playground" className="w-full">
                                <TabsList className="w-full justify-start overflow-x-auto">
                                    <TabsTrigger value="playground">{t("playground_json")}</TabsTrigger>
                                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                                    <TabsTrigger value="python">Python</TabsTrigger>
                                    <TabsTrigger value="templates">{t("my_templates")}</TabsTrigger>
                                </TabsList>

                                <TabsContent value="playground" className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-medium">{t("request_body")}</p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => {
                                                    // Reset to default based on selection
                                                    if (selectedTemplate) {
                                                        setRequestBody(JSON.stringify({
                                                            templateId: selectedTemplate.id,
                                                            layers: layersDataForSnippets
                                                        }, null, 2));
                                                        toast.info("Reset to default layers");
                                                    }
                                                }}
                                            >
                                                {t("reset")}
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={requestBody}
                                            onChange={(e) => setRequestBody(e.target.value)}
                                            className="font-mono text-xs min-h-[300px] bg-slate-950 text-slate-50 border-slate-800"
                                            spellCheck={false}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t("modify_json_hint")}
                                        </p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="javascript">
                                    <CodeSnippet language="json" code={jsCode} />
                                </TabsContent>
                                <TabsContent value="python">
                                    <CodeSnippet language="python" code={pythonCode} />
                                </TabsContent>
                                <TabsContent value="templates" className="space-y-4">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {t("view_copy_json_hint")}
                                    </p>
                                    {isLoadingTemplates ? (
                                        <div className="flex justify-center p-8">
                                            <Loader2 className="animate-spin h-6 w-6" />
                                        </div>
                                    ) : templates.length === 0 ? (
                                        <div className="text-center p-8 text-muted-foreground">
                                            {t("no_templates_found")}
                                        </div>
                                    ) : (
                                        templates.map((template) => (
                                            <Card key={template.id} className="overflow-hidden">
                                                <CardHeader className="pb-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle className="text-lg">{template.name}</CardTitle>
                                                            <CardDescription>
                                                                {template.width} x {template.height} px • {template.elements?.length || 0} elements
                                                            </CardDescription>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                const json = JSON.stringify(template.elements || [], null, 2);
                                                                navigator.clipboard.writeText(json).then(() => {
                                                                    toast.success(t("copied"), {
                                                                        description: `Template "${template.name}" JSON copied to clipboard.`
                                                                    });
                                                                });
                                                            }}
                                                        >
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            {t("copy_json")}
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="bg-slate-900 text-slate-300 p-4 rounded-md overflow-x-auto max-h-64">
                                                        <pre className="text-xs">
                                                            <code>{JSON.stringify(template.elements || [], null, 2)}</code>
                                                        </pre>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function ApiIntegrationPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}>
            <ApiIntegrationContent />
        </Suspense>
    );
}
