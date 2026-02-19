"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, ExternalLink, KeyRound, BookOpen, Lightbulb, Code, Braces, FileJson, Puzzle, RefreshCw, Play, Loader2, Check, X, AlertCircle, ChevronRight, Zap } from "lucide-react";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// --- Types Definition ---
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
    src?: string;
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
    generationTime?: number; // in seconds
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

// Snippet generators
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

const getCurlSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const defaultLayers = {
        "text-example": { "text": "Hello from cURL!", "color": "#FF5733" }
    };
    const finalLayers = layers && Object.keys(layers).length > 0 ? layers : defaultLayers;

    let code = '';
    code += `curl -X POST "${absoluteApiEndpoint}" \\\n`;
    code += `  -H "Authorization: Bearer ${apiKey}" \\\n`;
    code += `  -H "Content-Type: application/json" \\\n`;
    code += `  -d '${JSON.stringify({ templateId: templateId || 'YOUR_TEMPLATE_ID', layers: finalLayers }, null, 2)}'\n`;
    return code;
};

const getNodeSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const defaultLayers = {
        "text-example": { "text": "Hello from Node.js!", "color": "#68A063" }
    };
    const finalLayers = layers && Object.keys(layers).length > 0 ? layers : defaultLayers;

    let code = '';
    code += '// Node.js (axios) Example\n';
    code += 'const axios = require(\'axios\');\n\n';
    code += 'const renderImage = async () => {\n';
    code += '  try {\n';
    code += `    const response = await axios.post('${absoluteApiEndpoint}',\n`;
    code += '      {\n';
    code += `        templateId: "${templateId || 'YOUR_TEMPLATE_ID'}",\n`;
    code += `        layers: ${JSON.stringify(finalLayers, null, 6).replace(/\n/g, '\n        ')}\n`;
    code += '      },\n';
    code += '      {\n';
    code += `        headers: {\n`;
    code += `          'Authorization': 'Bearer ${apiKey}',\n`;
    code += `          'Content-Type': 'application/json'\n`;
    code += '        }\n';
    code += '      }\n';
    code += '    );\n';
    code += '    console.log(response.data);\n';
    code += '  } catch (error) {\n';
    code += '    console.error(error);\n';
    code += '  }\n';
    code += '};\n\n';
    code += 'renderImage();\n';
    return code;
};

import { useLanguage } from "@/lib/contexts/LanguageContext";

function ApiIntegrationContent() {
    const { t } = useLanguage();
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
                const { data: userData } = await supabase.auth.getUser();
                if (!userData?.user) {
                    setIsLoadingTemplateData(false);
                    setIsLoadingTemplates(false);
                    setIsLoadingApiKey(false);
                    return;
                }
                const userId = userData.user.id;

                // Ensure user exists in our custom user table
                const { data: existingUser, error: userCheckError } = await supabase
                    .from('user')
                    .select('id')
                    .eq('id', userId)
                    .single();

                if (!existingUser && userCheckError?.code === 'PGRST116') {
                    // User doesn't exist, create them
                    const { error: createUserError } = await supabase
                        .from('user')
                        .insert({
                            id: userId,
                            email: userData.user.email || '',
                            name: userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || 'User',
                            emailVerified: new Date().toISOString()
                        });

                    if (createUserError) {
                        console.error("Error creating user:", createUserError);
                    }
                }

                const { data: apiKeyData, error: apiKeyError } = await supabase
                    .from('user_api_keys')
                    .select('api_key')
                    .eq('user_id', userId)
                    .single();

                if (apiKeyError && apiKeyError.code !== 'PGRST116') {
                    console.error("Error fetching API Key:", apiKeyError);
                    toast.error("Could not load API Key. Check database permissions.");
                }

                if (apiKeyData?.api_key) {
                    setExampleApiKey(apiKeyData.api_key);
                } else {
                    const newKey = generateExampleApiKey();
                    setExampleApiKey(newKey);
                    const now = new Date().toISOString();

                    // Try to insert, if conflict, update
                    const { error: insertError } = await supabase
                        .from('user_api_keys')
                        .upsert(
                            { user_id: userId, api_key: newKey, createdAt: now, updatedAt: now },
                            { onConflict: 'user_id' }
                        );

                    if (insertError) {
                        console.error("Error saving API Key:", insertError);
                        // Try update as fallback
                        const { error: updateError } = await supabase
                            .from('user_api_keys')
                            .update({ api_key: newKey, updatedAt: now })
                            .eq('user_id', userId);

                        if (updateError) {
                            console.error("Error updating API Key:", updateError);
                            toast.error("Failed to save API Key");
                        }
                    }
                }
                setIsLoadingApiKey(false);

                const { data: templatesData, error: templatesError } = await supabase
                    .from('dynamic_canvas_templates')
                    .select('*')
                    .eq('user_id', userId)
                    .order('lastModified', { ascending: false });

                if (templatesData && templatesData.length > 0) {
                    const typedTemplates = templatesData.map(t => {
                        let elements = [];

                        if (t.json) {
                            try {
                                const parsed = JSON.parse(t.json);
                                if (parsed.version === "2.0" && parsed.elements) {
                                    elements = parsed.elements;
                                }
                            } catch (e) {
                                console.error("Error parsing JSON:", e);
                            }
                        }

                        if (elements.length === 0 && t.elements) {
                            elements = Array.isArray(t.elements) ? t.elements : [];
                        }

                        return {
                            id: t.id,
                            name: t.name || 'Untitled',
                            width: t.width || 800,
                            height: t.height || 600,
                            backgroundColor: t.background_color || '#fff',
                            elements: elements
                        } as Template;
                    });

                    setTemplates(typedTemplates);

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
            toast.success("API Key copied!");
        }).catch(err => {
            toast.error("Copy failed");
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
    const curlCode = useMemo(() => getCurlSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);
    const nodeCode = useMemo(() => getNodeSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);

    const handleTestApi = async () => {
        if (!selectedTemplate?.id) {
            toast.error("Please select a template first");
            return;
        }

        setIsTestingApi(true);
        setApiResponse(null);
        const startTime = Date.now();

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
            const endTime = Date.now();
            const generationTime = (endTime - startTime) / 1000;

            setApiResponse({
                status: response.status,
                data: data,
                generationTime: generationTime
            });

            if (response.ok) {
                toast.success("API test successful!");
            } else {
                toast.error("API test failed", { description: data.error || "Unknown error" });
            }

        } catch (error: any) {
            console.error("Test API Error:", error);
            const endTime = Date.now();
            const generationTime = (endTime - startTime) / 1000;
            setApiResponse({
                status: 500,
                error: error.message || "Network error",
                generationTime: generationTime
            });
            toast.error("Network Error");
        } finally {
            setIsTestingApi(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">{t("api_integration_title")}</h1>
                <p className="text-lg text-muted-foreground">
                    {t("api_integration_desc")}
                </p>
            </div>

            {/* Quick Start */}
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                        <Zap className="mr-2 h-6 w-6" />
                        {t("quick_start")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">1</div>
                            <div>
                                <p className="font-semibold">{t("quick_start_step1")}</p>
                                <p className="text-sm text-muted-foreground">{t("quick_start_step1_desc")}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">2</div>
                            <div>
                                <p className="font-semibold">{t("quick_start_step2")}</p>
                                <p className="text-sm text-muted-foreground">{t("quick_start_step2_desc")}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">3</div>
                            <div>
                                <p className="font-semibold">{t("quick_start_step3")}</p>
                                <p className="text-sm text-muted-foreground">{t("quick_start_step3_desc")}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">4</div>
                            <div>
                                <p className="font-semibold">{t("quick_start_step4")}</p>
                                <p className="text-sm text-muted-foreground">{t("quick_start_step4_desc")}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Playground Section - First */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                        <Play className="mr-2 h-6 w-6" />
                        {t("api_playground")}
                    </CardTitle>
                    <CardDescription>{t("api_playground_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Controls & Request */}
                        <div className="space-y-4">
                            {/* Template & API Key Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">{t("template")}</label>
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
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">{t("api_key")}</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={isLoadingApiKey ? "Loading..." : exampleApiKey}
                                            readOnly
                                            className="font-mono text-xs"
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
                                </div>
                            </div>

                            {/* Request Body */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium">{t("request_body")}</label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={() => {
                                            if (selectedTemplate) {
                                                setRequestBody(JSON.stringify({
                                                    templateId: selectedTemplate.id,
                                                    layers: layersDataForSnippets
                                                }, null, 2));
                                                toast.info(t("reset"));
                                            }
                                        }}
                                    >
                                        {t("reset")}
                                    </Button>
                                </div>
                                <Textarea
                                    value={requestBody}
                                    onChange={(e) => setRequestBody(e.target.value)}
                                    className="font-mono text-xs min-h-[200px] bg-slate-950 text-slate-50 border-slate-800"
                                    spellCheck={false}
                                />
                            </div>

                            {/* Test Button */}
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleTestApi}
                                disabled={isTestingApi || !selectedTemplate}
                            >
                                {isTestingApi ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("rendering")}
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" /> {t("run_request")}
                                    </>
                                )}
                            </Button>

                            {/* Status Response - Below the button */}
                            {apiResponse && (
                                <div className={`text-xs p-3 rounded-md ${apiResponse.status === 200 ? 'bg-green-50 text-green-900 border border-green-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-bold">{t("status")}: {apiResponse.status}</p>
                                        {apiResponse.generationTime && (
                                            <span className="text-green-600 font-semibold">
                                                {apiResponse.generationTime.toFixed(2)}s
                                            </span>
                                        )}
                                    </div>
                                    <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(apiResponse.data || { error: apiResponse.error }, null, 2)}</pre>
                                </div>
                            )}
                        </div>

                        {/* Right: Generated Image - Full height */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-2 block">{t("generated_image")}</label>
                            <div className="border rounded-lg flex-1 bg-slate-50 overflow-hidden min-h-[400px] flex items-center justify-center">
                                {apiResponse?.data?.imageUrl ? (
                                    <a href={apiResponse.data.imageUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center p-4">
                                        <img
                                            src={apiResponse.data.imageUrl}
                                            alt="Rendered Result"
                                            className="max-w-full max-h-full object-contain shadow-lg rounded"
                                        />
                                    </a>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-8 text-center">
                                        {t("generated_image_placeholder")}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Code Examples Section */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                        <Code className="mr-2 h-6 w-6" />
                        {t("code_examples")}
                    </CardTitle>
                    <CardDescription>{t("code_examples_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="simple" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="simple">{t("simple_code")}</TabsTrigger>
                            <TabsTrigger value="full">{t("full_code")}</TabsTrigger>
                        </TabsList>

                        {/* Simple Code - Only the payload */}
                        <TabsContent value="simple">
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    {t("simple_code_desc")}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Template ID */}
                                    <div className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-sm">{t("template_id")}</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(selectedTemplate?.id || '');
                                                    toast.success(t("copied"));
                                                }}
                                            >
                                                <Copy className="h-3 w-3 mr-1" /> {t("copy")}
                                            </Button>
                                        </div>
                                        <code className="text-xs bg-slate-100 px-2 py-1 rounded block overflow-x-auto">
                                            {selectedTemplate?.id || 'YOUR_TEMPLATE_ID'}
                                        </code>
                                    </div>

                                    {/* Layers Object */}
                                    <div className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-sm">{t("layers_object")}</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => {
                                                    const simpleLayers = Object.entries(layersDataForSnippets).reduce((acc, [id, el]) => {
                                                        if (el.type === 'text') {
                                                            acc[id] = { text: el.text || '' };
                                                        } else if (el.type === 'image') {
                                                            acc[id] = { image_url: el.src || '' };
                                                        }
                                                        return acc;
                                                    }, {} as Record<string, any>);
                                                    navigator.clipboard.writeText(JSON.stringify(simpleLayers, null, 2));
                                                    toast.success(t("copied"));
                                                }}
                                            >
                                                <Copy className="h-3 w-3 mr-1" /> {t("copy")}
                                            </Button>
                                        </div>
                                        <pre className="text-xs bg-slate-100 px-2 py-1 rounded overflow-x-auto max-h-[100px]">
                                            {JSON.stringify(Object.entries(layersDataForSnippets).reduce((acc, [id, el]) => {
                                                if (el.type === 'text') {
                                                    acc[id] = { text: el.text || '' };
                                                } else if (el.type === 'image') {
                                                    acc[id] = { image_url: el.src || '' };
                                                }
                                                return acc;
                                            }, {} as Record<string, any>), null, 2)}
                                        </pre>
                                    </div>

                                    {/* Full Payload */}
                                    <div className="border rounded-lg p-4 md:col-span-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-sm">{t("full_request_payload")}</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => {
                                                    const simplePayload = {
                                                        templateId: selectedTemplate?.id || '',
                                                        layers: Object.entries(layersDataForSnippets).reduce((acc, [id, el]) => {
                                                            if (el.type === 'text') {
                                                                acc[id] = { text: el.text || '' };
                                                            } else if (el.type === 'image') {
                                                                acc[id] = { image_url: el.src || '' };
                                                            }
                                                            return acc;
                                                        }, {} as Record<string, any>)
                                                    };
                                                    navigator.clipboard.writeText(JSON.stringify(simplePayload, null, 2));
                                                    toast.success(t("copied"));
                                                }}
                                            >
                                                <Copy className="h-3 w-3 mr-1" /> {t("copy")}
                                            </Button>
                                        </div>
                                        <pre className="text-xs bg-slate-100 px-2 py-1 rounded overflow-x-auto max-h-[150px]">
                                            {JSON.stringify({
                                                templateId: selectedTemplate?.id || '',
                                                layers: Object.entries(layersDataForSnippets).reduce((acc, [id, el]) => {
                                                    if (el.type === 'text') {
                                                        acc[id] = { text: el.text || '' };
                                                    } else if (el.type === 'image') {
                                                        acc[id] = { image_url: el.src || '' };
                                                    }
                                                    return acc;
                                                }, {} as Record<string, any>)
                                            }, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Full Code - Complete examples with headers */}
                        <TabsContent value="full">
                            <Tabs defaultValue="curl">
                                <TabsList>
                                    <TabsTrigger value="curl">cURL</TabsTrigger>
                                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                                    <TabsTrigger value="python">Python</TabsTrigger>
                                    <TabsTrigger value="node">Node.js</TabsTrigger>
                                </TabsList>

                                <TabsContent value="curl">
                                    <CodeSnippet language="cURL" code={curlCode} />
                                </TabsContent>

                                <TabsContent value="javascript">
                                    <CodeSnippet language="JavaScript" code={jsCode} />
                                </TabsContent>

                                <TabsContent value="python">
                                    <CodeSnippet language="Python" code={pythonCode} />
                                </TabsContent>

                                <TabsContent value="node">
                                    <CodeSnippet language="Node.js" code={nodeCode} />
                                </TabsContent>
                            </Tabs>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* API Reference Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    {/* Documentation Tabs */}
                    <Card>
                        <CardHeader><CardTitle>{t("api_reference")}</CardTitle></CardHeader>
                        <CardContent>
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="w-full justify-start overflow-x-auto">
                                    <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
                                    <TabsTrigger value="request">{t("request")}</TabsTrigger>
                                    <TabsTrigger value="response">{t("response")}</TabsTrigger>
                                    <TabsTrigger value="errors">{t("errors")}</TabsTrigger>
                                </TabsList>

                                {/* Overview Tab */}
                                <TabsContent value="overview" className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold mb-3">{t("endpoint")}</h3>
                                        <div className="bg-slate-900 text-white p-4 rounded-lg font-mono">
                                            <span className="text-green-400">POST</span> /api/render
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold mb-3">{t("authentication")}</h3>
                                        <p className="text-muted-foreground mb-3">{t("authentication_desc")}</p>
                                        <div className="bg-slate-900 text-white p-4 rounded-lg font-mono text-sm">
                                            Authorization: Bearer YOUR_API_KEY
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold mb-3">{t("features")}</h3>
                                        <ul className="space-y-2">
                                            <li className="flex items-start gap-2">
                                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                                <span>{t("feature_text")}</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                                <span>{t("feature_image")}</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                                <span>{t("feature_multiline")}</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                                <span>{t("feature_centering")}</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                                <span>{t("feature_cdn")}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </TabsContent>

                                {/* Request Tab */}
                                <TabsContent value="request" className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold mb-3">{t("request_body_title")}</h3>
                                        <p className="text-muted-foreground mb-4">{t("request_body_desc")}</p>

                                        <div className="space-y-4">
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-semibold mb-2">templateId</h4>
                                                <p className="text-sm text-muted-foreground mb-2">{t("templateid_required")}</p>
                                                <code className="text-sm bg-slate-100 px-2 py-1 rounded">string (required)</code>
                                            </div>

                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-semibold mb-2">layers</h4>
                                                <p className="text-sm text-muted-foreground mb-2">{t("layers_optional")}</p>
                                                <code className="text-sm bg-slate-100 px-2 py-1 rounded">object (optional)</code>
                                            </div>

                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-semibold mb-3">{t("text_properties")}</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <code className="bg-slate-100 px-2 py-1 rounded">text</code>
                                                        <span className="col-span-2">New text content</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <code className="bg-slate-100 px-2 py-1 rounded">color</code>
                                                        <span className="col-span-2">Text color (hex format)</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <code className="bg-slate-100 px-2 py-1 rounded">fontFamily</code>
                                                        <span className="col-span-2">Font family name</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-semibold mb-3">{t("image_properties")}</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <code className="bg-slate-100 px-2 py-1 rounded">image_url</code>
                                                        <span className="col-span-2">URL of the new image</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <code className="bg-slate-100 px-2 py-1 rounded">src</code>
                                                        <span className="col-span-2">Alternative to image_url</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <code className="bg-slate-100 px-2 py-1 rounded">url</code>
                                                        <span className="col-span-2">Alternative to image_url</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Response Tab */}
                                <TabsContent value="response" className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold mb-3">{t("success_response")}</h3>
                                        <div className="bg-slate-900 text-white p-4 rounded-lg font-mono text-sm">
                                            <pre>{`{
  "status": "success",
  "imageUrl": "https://cdn.example.com/renders/template-123.png"
}`}</pre>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold mb-3">{t("error_responses")}</h3>
                                        <div className="space-y-4">
                                            <div className="border border-red-200 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">401</div>
                                                    <span className="font-semibold">{t("unauthorized")}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{t("unauthorized_desc")}</p>
                                            </div>

                                            <div className="border border-red-200 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">400</div>
                                                    <span className="font-semibold">{t("bad_request")}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{t("bad_request_desc")}</p>
                                            </div>

                                            <div className="border border-red-200 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">404</div>
                                                    <span className="font-semibold">{t("not_found")}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{t("not_found_desc")}</p>
                                            </div>

                                            <div className="border border-red-200 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">500</div>
                                                    <span className="font-semibold">{t("server_error")}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{t("server_error_desc")}</p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Errors Tab */}
                                <TabsContent value="errors" className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                                {t("error_missing_templateid")}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-2">{t("error_missing_templateid_desc")}</p>
                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">{`{ "templateId": "your-template-id" }`}</code>
                                        </div>

                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                                {t("error_invalid_apikey")}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-2">{t("error_invalid_apikey_desc")}</p>
                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">Authorization: Bearer YOUR_API_KEY</code>
                                        </div>

                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                                {t("error_element_not_found")}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-2">{t("error_element_not_found_desc")}</p>
                                        </div>

                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                                {t("error_image_load")}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-2">{t("error_image_load_desc")}</p>
                                        </div>
                                    </div>
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
