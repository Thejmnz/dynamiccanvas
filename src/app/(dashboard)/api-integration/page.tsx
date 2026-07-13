"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Copy, ExternalLink, KeyRound, BookOpen, Lightbulb, Code, Braces, FileJson, Puzzle, RefreshCw, Play, Loader2, Check, X, AlertCircle, ChevronRight, Zap, ImageIcon, Type, ArrowRight } from "lucide-react";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { BrandLoading } from "@/components/brand-loading";

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
    lastModified?: string;
    thumbnailUrl?: string | null;
}

interface TemplateElement {
    id: string;
    type: 'text' | 'image';
    name?: string;
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
    image_url?: string;
    [key: string]: any;
}

const extractTemplateElements = (parsed: any): TemplateElement[] => {
    if (parsed?.version === "2.0" && Array.isArray(parsed.elements)) {
        return parsed.elements;
    }

    if (!Array.isArray(parsed?.objects)) return [];

    const workspace = parsed.objects.find((object: any) => object?.name === "clip");
    const workspaceLeft = Number(workspace?.left || 0);
    const workspaceTop = Number(workspace?.top || 0);

    return parsed.objects
        .filter((object: any) => object?.name !== "clip" && object?.visible !== false)
        .map((object: any, index: number) => {
            const originalType = String(object.type || "").toLowerCase();
            const type = ["textbox", "i-text", "text"].includes(originalType)
                ? "text"
                : originalType === "image"
                    ? "image"
                    : originalType;

            return {
                ...object,
                id: object.konvaId || object.name || `fabric-element-${index + 1}`,
                name: object.name,
                type,
                x: Number(object.left || 0) - workspaceLeft,
                y: Number(object.top || 0) - workspaceTop,
                rotation: Number(object.angle || 0),
                src: object.src,
                image_url: object.src,
                text: object.text,
                color: object.fill,
            } as TemplateElement;
        });
};

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

// Helper function to format relative time
const getRelativeTime = (dateString: string | undefined, language: string): string => {
    if (!dateString) return language === "es" ? "Fecha desconocida" : "Unknown date";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (language === "es") {
        if (diffSeconds < 60) return "Hace unos segundos";
        if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
        if (diffDays === 1) return "Ayer";
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return date.toLocaleDateString("es-ES");
    } else {
        if (diffSeconds < 60) return "A few seconds ago";
        if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString("en-US");
    }
};

interface CodeSnippetProps {
    language: string;
    code: string;
}

const highlightJsonCode = (code: string): React.ReactNode => {
    const lines = code.split('\n');
    return lines.map((line, lineIndex) => {
        const parts: React.ReactNode[] = [];
        let remaining = line;
        let keyIndex = 0;

        while (remaining.length > 0) {
            const keyMatch = remaining.match(/^"([^"]+)":\s*/);
            const stringMatch = remaining.match(/^:\s*"([^"]*)"/);
            const numberMatch = remaining.match(/^:\s*(\d+)/);
            const bracketMatch = remaining.match(/^([{}\[\]])/);
            const colonMatch = remaining.match(/^:\s*/);

            if (keyMatch) {
                parts.push(<span key={keyIndex++} className="text-cyan-400">"{keyMatch[1]}"</span>);
                parts.push(<span key={keyIndex++}>:</span>);
                remaining = remaining.slice(keyMatch[0].length);
            } else if (stringMatch) {
                parts.push(<span key={keyIndex++} className="text-green-400">"{stringMatch[1]}"</span>);
                remaining = remaining.slice(stringMatch[0].length);
            } else if (numberMatch) {
                parts.push(<span key={keyIndex++} className="text-yellow-400">{numberMatch[1]}</span>);
                remaining = remaining.slice(numberMatch[0].length);
            } else if (bracketMatch) {
                parts.push(<span key={keyIndex++} className="text-white">{bracketMatch[1]}</span>);
                remaining = remaining.slice(1);
            } else {
                parts.push(<span key={keyIndex++}>{remaining[0]}</span>);
                remaining = remaining.slice(1);
            }
        }

        return <div key={lineIndex}>{parts}</div>;
    });
};

const highlightPythonCode = (code: string): React.ReactNode => {
    const lines = code.split('\n');
    return lines.map((line, lineIndex) => {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('#')) {
            return <div key={lineIndex} className="text-gray-500">{line}</div>;
        }

        const parts: React.ReactNode[] = [];
        let remaining = line;
        let keyIndex = 0;

        const keywords = ['import', 'from', 'as', 'def', 'return', 'try', 'except', 'if', 'else', 'elif', 'for', 'while', 'with', 'class', 'True', 'False', 'None', 'print'];
        const functions = ['requests', 'json', 'post', 'get'];

        while (remaining.length > 0) {
            let matched = false;

            for (const kw of keywords) {
                const regex = new RegExp(`^\\b(${kw})\\b`);
                const match = remaining.match(regex);
                if (match) {
                    parts.push(<span key={keyIndex++} className="text-purple-400">{match[1]}</span>);
                    remaining = remaining.slice(match[0].length);
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                const stringMatch = remaining.match(/^("[^"]*"|'[^']*')/);
                if (stringMatch) {
                    parts.push(<span key={keyIndex++} className="text-green-400">{stringMatch[1]}</span>);
                    remaining = remaining.slice(stringMatch[0].length);
                    matched = true;
                }
            }

            if (!matched) {
                const numberMatch = remaining.match(/^\b(\d+)\b/);
                if (numberMatch) {
                    parts.push(<span key={keyIndex++} className="text-yellow-400">{numberMatch[1]}</span>);
                    remaining = remaining.slice(numberMatch[0].length);
                    matched = true;
                }
            }

            if (!matched) {
                const commentMatch = remaining.match(/^(#.*)$/);
                if (commentMatch) {
                    parts.push(<span key={keyIndex++} className="text-gray-500">{commentMatch[1]}</span>);
                    remaining = '';
                    matched = true;
                }
            }

            if (!matched) {
                parts.push(<span key={keyIndex++}>{remaining[0]}</span>);
                remaining = remaining.slice(1);
            }
        }

        return <div key={lineIndex}>{parts}</div>;
    });
};

const highlightCurlCode = (code: string): React.ReactNode => {
    const lines = code.split('\n');
    return lines.map((line, lineIndex) => {
        const parts: React.ReactNode[] = [];
        let remaining = line;
        let keyIndex = 0;

        while (remaining.length > 0) {
            const curlMatch = remaining.match(/^\b(curl)\b/);
            const flagMatch = remaining.match(/^(-[a-zA-Z]+)/);
            const stringMatch = remaining.match(/^("[^"]*")/);
            const methodMatch = remaining.match(/^(POST|GET|PUT|DELETE|PATCH)\b/);

            if (curlMatch) {
                parts.push(<span key={keyIndex++} className="text-pink-400">{curlMatch[1]}</span>);
                remaining = remaining.slice(curlMatch[0].length);
            } else if (flagMatch) {
                parts.push(<span key={keyIndex++} className="text-yellow-400">{flagMatch[1]}</span>);
                remaining = remaining.slice(flagMatch[0].length);
            } else if (stringMatch) {
                parts.push(<span key={keyIndex++} className="text-green-400">{stringMatch[1]}</span>);
                remaining = remaining.slice(stringMatch[0].length);
            } else if (methodMatch) {
                parts.push(<span key={keyIndex++} className="text-purple-400">{methodMatch[1]}</span>);
                remaining = remaining.slice(methodMatch[0].length);
            } else {
                parts.push(<span key={keyIndex++}>{remaining[0]}</span>);
                remaining = remaining.slice(1);
            }
        }

        return <div key={lineIndex}>{parts}</div>;
    });
};

const highlightPhpCode = (code: string): React.ReactNode => {
    const lines = code.split('\n');
    return lines.map((line, lineIndex) => {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
            return <div key={lineIndex} className="text-gray-500">{line}</div>;
        }

        const parts: React.ReactNode[] = [];
        let remaining = line;
        let keyIndex = 0;

        const keywords = ['function', 'return', 'new', 'try', 'catch', 'if', 'else', 'foreach', 'as', 'true', 'false', 'null', 'array', 'echo', 'print'];

        while (remaining.length > 0) {
            let matched = false;

            if (remaining.startsWith('<?php')) {
                parts.push(<span key={keyIndex++} className="text-pink-400">{'<?php'}</span>);
                remaining = remaining.slice(5);
                matched = true;
            }

            if (!matched) {
                const varMatch = remaining.match(/^(\$\w+)/);
                if (varMatch) {
                    parts.push(<span key={keyIndex++} className="text-cyan-400">{varMatch[1]}</span>);
                    remaining = remaining.slice(varMatch[0].length);
                    matched = true;
                }
            }

            if (!matched) {
                for (const kw of keywords) {
                    const regex = new RegExp(`^\\b(${kw})\\b`);
                    const match = remaining.match(regex);
                    if (match) {
                        parts.push(<span key={keyIndex++} className="text-purple-400">{match[1]}</span>);
                        remaining = remaining.slice(match[0].length);
                        matched = true;
                        break;
                    }
                }
            }

            if (!matched) {
                const stringMatch = remaining.match(/^("[^"]*"|'[^']*')/);
                if (stringMatch) {
                    parts.push(<span key={keyIndex++} className="text-green-400">{stringMatch[1]}</span>);
                    remaining = remaining.slice(stringMatch[0].length);
                    matched = true;
                }
            }

            if (!matched) {
                parts.push(<span key={keyIndex++}>{remaining[0]}</span>);
                remaining = remaining.slice(1);
            }
        }

        return <div key={lineIndex}>{parts}</div>;
    });
};

const highlightJavaCode = (code: string): React.ReactNode => {
    const lines = code.split('\n');
    return lines.map((line, lineIndex) => {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('//')) {
            return <div key={lineIndex} className="text-gray-500">{line}</div>;
        }

        const parts: React.ReactNode[] = [];
        let remaining = line;
        let keyIndex = 0;

        const keywords = ['public', 'private', 'protected', 'class', 'static', 'void', 'return', 'new', 'try', 'catch', 'if', 'else', 'for', 'while', 'import', 'package', 'extends', 'implements', 'true', 'false', 'null', 'int', 'String', 'byte', 'short', 'long', 'float', 'double', 'boolean', 'char'];

        while (remaining.length > 0) {
            let matched = false;

            for (const kw of keywords) {
                const regex = new RegExp(`^\\b(${kw})\\b`);
                const match = remaining.match(regex);
                if (match) {
                    parts.push(<span key={keyIndex++} className="text-purple-400">{match[1]}</span>);
                    remaining = remaining.slice(match[0].length);
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                const stringMatch = remaining.match(/^("[^"]*")/);
                if (stringMatch) {
                    parts.push(<span key={keyIndex++} className="text-green-400">{stringMatch[1]}</span>);
                    remaining = remaining.slice(stringMatch[0].length);
                    matched = true;
                }
            }

            if (!matched) {
                const numberMatch = remaining.match(/^\b(\d+)\b/);
                if (numberMatch) {
                    parts.push(<span key={keyIndex++} className="text-yellow-400">{numberMatch[1]}</span>);
                    remaining = remaining.slice(numberMatch[0].length);
                    matched = true;
                }
            }

            if (!matched) {
                const annotationMatch = remaining.match(/^(@\w+)/);
                if (annotationMatch) {
                    parts.push(<span key={keyIndex++} className="text-pink-400">{annotationMatch[1]}</span>);
                    remaining = remaining.slice(annotationMatch[0].length);
                    matched = true;
                }
            }

            if (!matched) {
                parts.push(<span key={keyIndex++}>{remaining[0]}</span>);
                remaining = remaining.slice(1);
            }
        }

        return <div key={lineIndex}>{parts}</div>;
    });
};

const highlightCode = (code: string, language: string): React.ReactNode => {
    const lang = language.toLowerCase();
    
    if (lang === 'json' || lang === 'javascript') {
        return highlightJsonCode(code);
    }
    if (lang === 'python') {
        return highlightPythonCode(code);
    }
    if (lang === 'curl') {
        return highlightCurlCode(code);
    }
    if (lang === 'php') {
        return highlightPhpCode(code);
    }
    if (lang === 'java') {
        return highlightJavaCode(code);
    }
    
    return code;
};

const CodeSnippet: React.FC<CodeSnippetProps> = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            toast.success("Copied!", { description: `${language} code copied to clipboard.` });
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            toast.error("Copy Failed", { description: "Could not copy to clipboard." });
        });
    };

    return (
        <div className="relative group rounded-lg overflow-hidden border border-white/10 bg-gradient-to-br from-[#1e293b] to-[#0f172a] flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-black/20 border-b border-white/5 flex-shrink-0">
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{language}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-slate-400 hover:text-white hover:bg-white/10"
                    onClick={copyToClipboard}
                >
                    {copied ? (
                        <>
                            <Check className="h-3 w-3 mr-1 text-green-400" />
                            <span className="text-green-400">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                        </>
                    )}
                </Button>
            </div>

            {/* Code */}
            <pre className="p-4 overflow-auto text-xs font-mono text-slate-300 leading-relaxed flex-1 min-h-0 whitespace-pre-wrap break-all">
                <code>{highlightCode(code.trim(), language)}</code>
            </pre>
        </div>
    );
};


// Snippet generators
const getJsSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const simpleLayers: Record<string, any> = {};
    if (layers && Object.keys(layers).length > 0) {
        Object.entries(layers).forEach(([id, data]) => {
            if (data.type === 'text') {
                simpleLayers[id] = { text: data.text || '' };
            } else if (data.type === 'image') {
                simpleLayers[id] = { image_url: data.src || data.image_url || '' };
            }
        });
    }
    if (Object.keys(simpleLayers).length === 0) {
        simpleLayers["text-example"] = { text: "Provide text here" };
    }

    return JSON.stringify({
        templateId: templateId || 'YOUR_TEMPLATE_ID',
        layers: simpleLayers
    }, null, 2);
};

const getPythonSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const simpleLayers: Record<string, any> = {};
    if (layers && Object.keys(layers).length > 0) {
        Object.entries(layers).forEach(([id, data]) => {
            if (data.type === 'text') {
                simpleLayers[id] = { text: data.text || '' };
            } else if (data.type === 'image') {
                simpleLayers[id] = { image_url: data.src || data.image_url || '' };
            }
        });
    }
    if (Object.keys(simpleLayers).length === 0) {
        simpleLayers["text-example"] = { text: "Hello from Python!" };
    }

    const layersJson = JSON.stringify(simpleLayers, null, 4).replace(/\n/g, '\n    ');
    
    let code = '# Python Request Example\n';
    code += 'import requests\n\n';
    code += `api_url = "${absoluteApiEndpoint}"\n`;
    code += `headers = {\n    "Authorization": "Bearer ${apiKey}",\n    "Content-Type": "application/json"\n}\n\n`;
    code += 'payload = {\n';
    code += `    "templateId": "${templateId || 'YOUR_TEMPLATE_ID'}",\n`;
    code += `    "layers": ${layersJson}\n`;
    code += '}\n\n';
    code += "response = requests.post(api_url, headers=headers, json=payload)\n";
    code += "print(response.json())";
    return code;
};

const getCurlSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const simpleLayers: Record<string, any> = {};
    if (layers && Object.keys(layers).length > 0) {
        Object.entries(layers).forEach(([id, data]) => {
            if (data.type === 'text') {
                simpleLayers[id] = { text: data.text || '' };
            } else if (data.type === 'image') {
                simpleLayers[id] = { image_url: data.src || data.image_url || '' };
            }
        });
    }
    if (Object.keys(simpleLayers).length === 0) {
        simpleLayers["text-example"] = { text: "Hello from cURL!" };
    }

    const payloadJson = JSON.stringify({ 
        templateId: templateId || 'YOUR_TEMPLATE_ID', 
        layers: simpleLayers 
    }, null, 2).replace(/'/g, "'\\''");
    
    let code = `curl -X POST "${absoluteApiEndpoint}" \\\n`;
    code += `  -H "Authorization: Bearer ${apiKey}" \\\n`;
    code += `  -H "Content-Type: application/json" \\\n`;
    code += `  -d '${payloadJson}'\n`;
    return code;
};

const getNodeSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const simpleLayers: Record<string, any> = {};
    if (layers && Object.keys(layers).length > 0) {
        Object.entries(layers).forEach(([id, data]) => {
            if (data.type === 'text') {
                simpleLayers[id] = { text: data.text || '' };
            } else if (data.type === 'image') {
                simpleLayers[id] = { image_url: data.src || data.image_url || '' };
            }
        });
    }
    if (Object.keys(simpleLayers).length === 0) {
        simpleLayers["text-example"] = { text: "Hello from Node.js!" };
    }

    const layersJson = JSON.stringify(simpleLayers, null, 6).replace(/\n/g, '\n        ');

    let code = '// Node.js (axios) Example\n';
    code += 'const axios = require(\'axios\');\n\n';
    code += 'const renderImage = async () => {\n';
    code += '  try {\n';
    code += `    const response = await axios.post('${absoluteApiEndpoint}',\n`;
    code += '      {\n';
    code += `        templateId: "${templateId || 'YOUR_TEMPLATE_ID'}",\n`;
    code += `        layers: ${layersJson}\n`;
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

const getPhpSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const simpleLayers: Record<string, any> = {};
    if (layers && Object.keys(layers).length > 0) {
        Object.entries(layers).forEach(([id, data]) => {
            if (data.type === 'text') {
                simpleLayers[id] = { text: data.text || '' };
            } else if (data.type === 'image') {
                simpleLayers[id] = { image_url: data.src || data.image_url || '' };
            }
        });
    }
    if (Object.keys(simpleLayers).length === 0) {
        simpleLayers["text-example"] = { text: "Hello from PHP!" };
    }
    const layersJson = JSON.stringify(simpleLayers).replace(/'/g, "\\'");

    let code = '<?php\n';
    code += '// PHP Example using cURL\n\n';
    code += `$apiUrl = "${absoluteApiEndpoint}";\n`;
    code += `$apiKey = "${apiKey}";\n\n`;
    code += `$payload = array(\n`;
    code += `    "templateId" => "${templateId || 'YOUR_TEMPLATE_ID'}",\n`;
    code += `    "layers" => json_decode('${layersJson}', true)\n`;
    code += `);\n\n`;
    code += `$ch = curl_init($apiUrl);\n`;
    code += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`;
    code += `curl_setopt($ch, CURLOPT_POST, true);\n`;
    code += `curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));\n`;
    code += `curl_setopt($ch, CURLOPT_HTTPHEADER, array(\n`;
    code += `    "Authorization: Bearer " . $apiKey,\n`;
    code += `    "Content-Type: application/json"\n`;
    code += `));\n\n`;
    code += `$response = curl_exec($ch);\n`;
    code += `curl_close($ch);\n\n`;
    code += `$result = json_decode($response, true);\n`;
    code += `print_r($result);\n`;
    code += `?>`;
    return code;
};

const getJavaSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const simpleLayers: Record<string, any> = {};
    if (layers && Object.keys(layers).length > 0) {
        Object.entries(layers).forEach(([id, data]) => {
            if (data.type === 'text') {
                simpleLayers[id] = { text: data.text || '' };
            } else if (data.type === 'image') {
                simpleLayers[id] = { image_url: data.src || data.image_url || '' };
            }
        });
    }
    if (Object.keys(simpleLayers).length === 0) {
        simpleLayers["text-example"] = { text: "Hello from Java!" };
    }
    const layersJson = JSON.stringify(simpleLayers).replace(/"/g, '\\"');

    let code = '// Java Example using HttpURLConnection\n';
    code += 'import java.net.*;\n';
    code += 'import java.io.*;\n\n';
    code += 'public class ApiRequest {\n';
    code += '    public static void main(String[] args) throws Exception {\n';
    code += `        URL url = new URL("${absoluteApiEndpoint}");\n`;
    code += '        HttpURLConnection conn = (HttpURLConnection) url.openConnection();\n';
    code += '        conn.setRequestMethod("POST");\n';
    code += `        conn.setRequestProperty("Authorization", "Bearer ${apiKey}");\n`;
    code += '        conn.setRequestProperty("Content-Type", "application/json");\n';
    code += '        conn.setDoOutput(true);\n\n';
    code += `        String jsonInputString = "{\\"templateId\\": \\"${templateId || 'YOUR_TEMPLATE_ID'}\\", \\"layers\\": ${layersJson.replace(/"/g, '\\\\"')}}";\n\n`;
    code += '        try (OutputStream os = conn.getOutputStream()) {\n';
    code += '            byte[] input = jsonInputString.getBytes("utf-8");\n';
    code += '            os.write(input, 0, input.length);\n';
    code += '        }\n\n';
    code += '        int responseCode = conn.getResponseCode();\n';
    code += '        System.out.println("Response Code: " + responseCode);\n';
    code += '        conn.disconnect();\n';
    code += '    }\n';
    code += '}';
    return code;
};

// Helper to get all layer properties
const getFullLayers = (layers?: Record<string, any>): Record<string, any> => {
    const fullLayers: Record<string, any> = {};
    if (layers && Object.keys(layers).length > 0) {
        Object.entries(layers).forEach(([id, data]) => {
            const layerData: Record<string, any> = {};
            
            if (data.type === 'text') {
                if (data.text !== undefined) layerData.text = data.text;
                if (data.fontSize !== undefined) layerData.fontSize = data.fontSize;
                if (data.fontFamily !== undefined) layerData.fontFamily = data.fontFamily;
                if (data.color !== undefined) layerData.color = data.color;
                if (data.textAlign !== undefined) layerData.textAlign = data.textAlign;
                if (data.x !== undefined) layerData.x = data.x;
                if (data.y !== undefined) layerData.y = data.y;
                if (data.width !== undefined) layerData.width = data.width;
                if (data.height !== undefined) layerData.height = data.height;
                if (data.lineHeight !== undefined) layerData.lineHeight = data.lineHeight;
                if (data.zIndex !== undefined) layerData.zIndex = data.zIndex;
            } else if (data.type === 'image') {
                const imgUrl = data.src || data.image_url || '';
                if (imgUrl) layerData.image_url = imgUrl;
                if (data.x !== undefined) layerData.x = data.x;
                if (data.y !== undefined) layerData.y = data.y;
                if (data.width !== undefined) layerData.width = data.width;
                if (data.height !== undefined) layerData.height = data.height;
                if (data.zIndex !== undefined) layerData.zIndex = data.zIndex;
            }
            
            if (Object.keys(layerData).length > 0) {
                fullLayers[id] = layerData;
            }
        });
    }
    if (Object.keys(fullLayers).length === 0) {
        fullLayers["text-example"] = { 
            text: "Hello World!", 
            fontSize: 24, 
            fontFamily: "Arial",
            color: "#000000",
            textAlign: "center",
            x: 100,
            y: 100
        };
    }
    return fullLayers;
};

// Full Code Snippets - Include all properties
const getFullJsSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const fullLayers = getFullLayers(layers);
    return JSON.stringify({
        templateId: templateId || 'YOUR_TEMPLATE_ID',
        layers: fullLayers
    }, null, 2);
};

const getFullPythonSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const fullLayers = getFullLayers(layers);
    const layersJson = JSON.stringify(fullLayers, null, 4).replace(/\n/g, '\n    ');
    
    let code = '# Python Request Example (Full)\n';
    code += 'import requests\n\n';
    code += `api_url = "${absoluteApiEndpoint}"\n`;
    code += `headers = {\n    "Authorization": "Bearer ${apiKey}",\n    "Content-Type": "application/json"\n}\n\n`;
    code += 'payload = {\n';
    code += `    "templateId": "${templateId || 'YOUR_TEMPLATE_ID'}",\n`;
    code += `    "layers": ${layersJson}\n`;
    code += '}\n\n';
    code += "response = requests.post(api_url, headers=headers, json=payload)\n";
    code += "print(response.json())";
    return code;
};

const getFullCurlSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const fullLayers = getFullLayers(layers);
    const payloadJson = JSON.stringify({ 
        templateId: templateId || 'YOUR_TEMPLATE_ID', 
        layers: fullLayers 
    }, null, 2).replace(/'/g, "'\\''");
    
    let code = `curl -X POST "${absoluteApiEndpoint}" \\\n`;
    code += `  -H "Authorization: Bearer ${apiKey}" \\\n`;
    code += `  -H "Content-Type: application/json" \\\n`;
    code += `  -d '${payloadJson}'\n`;
    return code;
};

const getFullNodeSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const fullLayers = getFullLayers(layers);
    const layersJson = JSON.stringify(fullLayers, null, 6).replace(/\n/g, '\n        ');

    let code = '// Node.js (axios) Example (Full)\n';
    code += 'const axios = require(\'axios\');\n\n';
    code += 'const renderImage = async () => {\n';
    code += '  try {\n';
    code += `    const response = await axios.post('${absoluteApiEndpoint}',\n`;
    code += '      {\n';
    code += `        templateId: "${templateId || 'YOUR_TEMPLATE_ID'}",\n`;
    code += `        layers: ${layersJson}\n`;
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

const getFullPhpSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const fullLayers = getFullLayers(layers);
    const layersJson = JSON.stringify(fullLayers).replace(/'/g, "\\'");

    let code = '<?php\n';
    code += '// PHP Example using cURL (Full)\n\n';
    code += `$apiUrl = "${absoluteApiEndpoint}";\n`;
    code += `$apiKey = "${apiKey}";\n\n`;
    code += `$payload = array(\n`;
    code += `    "templateId" => "${templateId || 'YOUR_TEMPLATE_ID'}",\n`;
    code += `    "layers" => json_decode('${layersJson}', true)\n`;
    code += `);\n\n`;
    code += `$ch = curl_init($apiUrl);\n`;
    code += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`;
    code += `curl_setopt($ch, CURLOPT_POST, true);\n`;
    code += `curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));\n`;
    code += `curl_setopt($ch, CURLOPT_HTTPHEADER, array(\n`;
    code += `    "Authorization: Bearer " . $apiKey,\n`;
    code += `    "Content-Type: application/json"\n`;
    code += `));\n\n`;
    code += `$response = curl_exec($ch);\n`;
    code += `curl_close($ch);\n\n`;
    code += `$result = json_decode($response, true);\n`;
    code += `print_r($result);\n`;
    code += `?>`;
    return code;
};

const getFullJavaSnippet = (absoluteApiEndpoint: string, apiKey: string, templateId?: string | null, layers?: Record<string, any>) => {
    const fullLayers = getFullLayers(layers);
    const layersJson = JSON.stringify(fullLayers).replace(/"/g, '\\"');

    let code = '// Java Example using HttpURLConnection (Full)\n';
    code += 'import java.net.*;\n';
    code += 'import java.io.*;\n\n';
    code += 'public class ApiRequest {\n';
    code += '    public static void main(String[] args) throws Exception {\n';
    code += `        URL url = new URL("${absoluteApiEndpoint}");\n`;
    code += '        HttpURLConnection conn = (HttpURLConnection) url.openConnection();\n';
    code += '        conn.setRequestMethod("POST");\n';
    code += `        conn.setRequestProperty("Authorization", "Bearer ${apiKey}");\n`;
    code += '        conn.setRequestProperty("Content-Type", "application/json");\n';
    code += '        conn.setDoOutput(true);\n\n';
    code += `        String jsonInputString = "{\\"templateId\\": \\"${templateId || 'YOUR_TEMPLATE_ID'}\\", \\"layers\\": ${layersJson.replace(/"/g, '\\\\"')}}";\n\n`;
    code += '        try (OutputStream os = conn.getOutputStream()) {\n';
    code += '            byte[] input = jsonInputString.getBytes("utf-8");\n';
    code += '            os.write(input, 0, input.length);\n';
    code += '        }\n\n';
    code += '        int responseCode = conn.getResponseCode();\n';
    code += '        System.out.println("Response Code: " + responseCode);\n';
    code += '        conn.disconnect();\n';
    code += '    }\n';
    code += '}';
    return code;
};

function ApiIntegrationContent() {
    const { t, language } = useLanguage();
    const router = useRouter();
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
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleModalOpenChange = (open: boolean) => {
        setIsModalOpen(open);

        if (!open) {
            window.requestAnimationFrame(() => {
                document.body.style.removeProperty("pointer-events");
            });
        }
    };

    useEffect(() => {
        return () => {
            document.body.style.removeProperty("pointer-events");
        };
    }, []);

    // Sync request body with form data
    useEffect(() => {
        if (selectedTemplate) {
            // Build layers object from form data - only include editable fields
            const layers: Record<string, { text?: string; src?: string; image_url?: string }> = {};
            Object.entries(layersDataForSnippets).forEach(([id, el]) => {
                if (el.type === 'text') {
                    layers[id] = { text: el.text || '' };
                } else if (el.type === 'image') {
                    layers[id] = { image_url: el.src || el.image_url || '' };
                }
            });

            setRequestBody(JSON.stringify({
                templateId: selectedTemplate.id,
                layers
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
                                elements = extractTemplateElements(parsed);
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
                            elements: elements,
                            lastModified: t.lastModified,
                            thumbnailUrl: t.thumbnailUrl || t.thumbnail_url || null,
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
                            acc[el.id] = {
                                ...el,
                                text: el.text || '',
                                src: el.src || el.image_url || '',
                                image_url: el.src || el.image_url || ''
                            };
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
            setApiResponse(null); // Clear previous response
            if (Array.isArray(template.elements)) {
                const updatedLayers = template.elements.reduce((acc, el) => {
                    acc[el.id] = {
                        ...el,
                        text: el.text || '',
                        src: el.src || el.image_url || '',
                        image_url: el.src || el.image_url || ''
                    };
                    return acc;
                }, {} as Record<string, TemplateElement>);
                setLayersDataForSnippets(updatedLayers);
            }
        }
    };

    // Generate snippets - Simple (basic properties only)
    const jsCode = useMemo(() => getJsSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);
    const [editableJsPayload, setEditableJsPayload] = useState<string>(() => jsCode);
    useEffect(() => { setEditableJsPayload(jsCode); }, [jsCode]);
    const pythonCode = useMemo(() => getPythonSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);
    const curlCode = useMemo(() => getCurlSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);
    const phpCode = useMemo(() => getPhpSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);
    const javaCode = useMemo(() => getJavaSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);
    
    // Generate snippets - Full (all properties)
    const fullJsCode = useMemo(() => getFullJsSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);
    const fullPythonCode = useMemo(() => getFullPythonSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);
    const fullCurlCode = useMemo(() => getFullCurlSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);
    const fullNodeCode = useMemo(() => getFullNodeSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);
    const fullPhpCode = useMemo(() => getFullPhpSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);
    const fullJavaCode = useMemo(() => getFullJavaSnippet(ABSOLUTE_API_ENDPOINT, exampleApiKey, selectedTemplate?.id, layersDataForSnippets), [exampleApiKey, selectedTemplate, layersDataForSnippets]);

    const isPlaygroundLoading = isLoadingApiKey
        || isLoadingTemplateData
        || isLoadingTemplates
        || !selectedTemplate;

    if (isPlaygroundLoading) {
        return <BrandLoading label="" className="min-h-[70vh] border-0 bg-transparent" />;
    }

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
        <div className="container mx-auto max-w-5xl py-8">
            <div className="mb-9 rounded-[28px] border-2 border-[#101426] bg-[#e9e5ff] p-7 shadow-[7px_7px_0_#101426]">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#5b35d5]">API LAB</p>
                <h1 className="mb-2 text-4xl font-black tracking-[-0.04em] text-[#101426]">{language === "es" ? "Playground" : "Playground"}</h1>
                <p className="text-lg text-muted-foreground">
                    {language === "es"
                        ? "Selecciona una plantilla para generar imágenes a través de la API."
                        : "Select a template to generate images through the API."}
                </p>
            </div>

            {/* Template Selection */}
            <div className="flex gap-2 items-center">
                <Select value={selectedTemplate?.id || ''} onValueChange={handleTemplateSelect} disabled={isLoadingTemplates}>
                    <SelectTrigger className="h-12 text-base max-w-md">
                        <SelectValue placeholder={t("select_a_template_placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                        {templates.map(t => (
                            <SelectItem key={t.id} value={t.id} className="text-base py-2">
                                {t.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {selectedTemplate && (
                    <Button
                        className="h-12 bg-[#5b35d5] hover:bg-[#101426]"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Play className="h-4 w-4 mr-2" />
                        {language === "es" ? "Abrir" : "Open"}
                    </Button>
                )}
            </div>

            {/* Focused playground workspace */}
            <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
                <DialogContent className="flex h-[96vh] max-h-[96vh] w-[98vw] max-w-[98vw] flex-col gap-0 overflow-hidden rounded-2xl border border-[#101426]/15 bg-white p-0 shadow-2xl">
                    <DialogHeader className="shrink-0 border-b border-[#101426]/10 px-6 py-4 pr-16">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-[#101426]/40">Playground</span>
                                    <ChevronRight className="size-4 text-[#101426]/25" />
                                    <DialogTitle className="truncate text-2xl font-black tracking-[-0.03em] text-[#101426]">
                                        {selectedTemplate?.name || t("template")}
                                    </DialogTitle>
                                </div>
                                <DialogDescription className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#101426]/50">
                                    <span>{selectedTemplate?.width} × {selectedTemplate?.height} px</span><span>•</span>
                                    <span>{selectedTemplate?.elements?.length || 0} {language === "es" ? "capas" : "layers"}</span><span>•</span>
                                    <span>{language === "es" ? "Editado" : "Edited"} {getRelativeTime(selectedTemplate?.lastModified, language).toLowerCase()}</span><span>•</span>
                                    <span className="max-w-[280px] truncate font-mono">{selectedTemplate?.id}</span>
                                </DialogDescription>
                            </div>
                            <Button
                                variant="outline"
                                className="mr-2 h-11 shrink-0 rounded-xl border-[#101426]/15 bg-white px-5 font-bold"
                                onClick={() => selectedTemplate && router.push("/editor/" + selectedTemplate.id)}
                            >
                                {language === "es" ? "Abrir en el editor" : "Open in Editor"}
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[34%_66%]">
                        <aside className="flex min-h-0 flex-col border-r border-[#101426]/10 bg-white">
                            <div className="flex-1 space-y-4 overflow-y-auto p-5">
                                <div className="flex items-center rounded-2xl bg-[#f6f7f9] p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-[#101426]/70">{language === "es" ? "Formato:" : "Format:"}</span>
                                        <span className="flex h-10 items-center gap-2 rounded-xl border border-[#101426]/15 bg-white px-4 text-sm font-bold">
                                            <ImageIcon className="size-4 text-[#5b35d5]" /> JPG
                                        </span>
                                    </div>
                                </div>

                                {selectedTemplate && Array.isArray(selectedTemplate.elements) && selectedTemplate.elements.filter(el => el.type === "text" || el.type === "image").length > 0 ? (
                                    selectedTemplate.elements
                                        .filter(el => el.type === "text" || el.type === "image")
                                        .map((element) => (
                                            <div key={element.id} className="rounded-2xl bg-[#f6f7f9] p-4">
                                                <div className="mb-4 flex items-start gap-3">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        {element.type === "text" ? <Type className="size-4 shrink-0 text-[#101426]/55" /> : <ImageIcon className="size-4 shrink-0 text-[#101426]/55" />}
                                                        <span className="truncate font-mono text-sm font-black">{element.name || element.id}</span>
                                                    </div>
                                                </div>
                                                <label className="mb-2 block text-xs font-semibold text-[#101426]/55">
                                                    {element.type === "text" ? (language === "es" ? "Texto" : "Text") : (language === "es" ? "URL de imagen" : "Image URL")}
                                                </label>
                                                <Input
                                                    value={element.type === "text" ? (layersDataForSnippets[element.id]?.text || "") : (layersDataForSnippets[element.id]?.src || layersDataForSnippets[element.id]?.image_url || "")}
                                                    onChange={(event) => setLayersDataForSnippets(prev => ({
                                                        ...prev,
                                                        [element.id]: element.type === "text"
                                                            ? { ...prev[element.id], type: "text", text: event.target.value }
                                                            : { ...prev[element.id], type: "image", src: event.target.value, image_url: event.target.value }
                                                    }))}
                                                    placeholder={element.type === "text" ? (language === "es" ? "Escribe el texto" : "Enter text") : "https://example.com/image.jpg"}
                                                    className="h-12 border-[#101426]/15 bg-white"
                                                />
                                            </div>
                                        ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-[#101426]/15 p-8 text-center text-sm text-[#101426]/45">
                                        {language === "es" ? "Esta plantilla no tiene capas editables." : "This template has no editable layers."}
                                    </div>
                                )}
                            </div>
                            <div className="shrink-0 border-t border-[#101426]/10 bg-white p-5">
                                <Button className="h-12 w-full rounded-xl bg-[#2161ed] text-base font-bold hover:bg-[#174bc2]" onClick={handleTestApi} disabled={isTestingApi || !selectedTemplate}>
                                    {isTestingApi ? <><Loader2 className="mr-2 size-4 animate-spin" />{language === "es" ? "Generando..." : "Generating..."}</> : (language === "es" ? "Generar render" : "Generate Render")}
                                </Button>
                            </div>
                        </aside>

                        <section className="grid min-h-0 grid-rows-[minmax(330px,56%)_minmax(240px,44%)] bg-[#fafbfc]">
                            <Tabs defaultValue="preview" className="flex min-h-0 flex-col">
                                <div className="flex justify-center p-4 pb-2">
                                    <TabsList className="h-11 rounded-xl border border-[#101426]/10 bg-[#f1f2f5] p-1">
                                        <TabsTrigger value="preview" className="gap-2 rounded-lg px-5 data-[state=active]:bg-white"><ImageIcon className="size-4" />{language === "es" ? "Vista previa" : "Preview"}</TabsTrigger>
                                        <TabsTrigger value="response" className="gap-2 rounded-lg px-5"><Braces className="size-4" />{language === "es" ? "Respuesta" : "Response"}</TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="preview" className="mt-0 min-h-0 flex-1 px-5 pb-5">
                                    <div className="flex h-full items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(#d8dcf2_1.5px,transparent_1.5px)] [background-size:24px_24px]">
                                        {(apiResponse?.data?.imageUrl || selectedTemplate?.thumbnailUrl) ? (
                                            <img src={apiResponse?.data?.imageUrl || selectedTemplate?.thumbnailUrl || ""} alt={selectedTemplate?.name || "Preview"} className="max-h-[95%] max-w-[92%] rounded-md object-contain shadow-xl" />
                                        ) : (
                                            <div className="max-w-sm text-center text-sm leading-relaxed text-[#101426]/45">
                                                <ImageIcon className="mx-auto mb-3 size-8 opacity-40" />
                                                {language === "es" ? "Completa los valores de las capas y pulsa “Generar render” para ver el resultado." : "Fill in the layer values and click “Generate Render” to see the result."}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                                <TabsContent value="response" className="mt-0 min-h-0 flex-1 px-5 pb-5">
                                    <pre className="h-full overflow-auto rounded-xl bg-[#171925] p-5 text-xs leading-6 text-slate-300">{JSON.stringify(apiResponse?.data || (apiResponse ? { status: apiResponse.status, error: apiResponse.error } : { message: language === "es" ? "Genera un render para ver la respuesta." : "Generate a render to see the response." }), null, 2)}</pre>
                                </TabsContent>
                            </Tabs>

                            <div className="min-h-0 border-t border-[#101426]/10 bg-white">
                                <Tabs defaultValue="javascript" className="flex h-full min-h-0 flex-col">
                                    <TabsList className="h-14 w-full shrink-0 justify-start gap-1 overflow-x-auto rounded-none border-b border-[#101426]/10 bg-white px-3">
                                        <TabsTrigger value="javascript" className="h-full rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-[#2161ed] data-[state=active]:shadow-none">JavaScript</TabsTrigger>
                                        <TabsTrigger value="python" className="h-full rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-[#2161ed] data-[state=active]:shadow-none">Python</TabsTrigger>
                                        <TabsTrigger value="java" className="h-full rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-[#2161ed] data-[state=active]:shadow-none">Java</TabsTrigger>
                                        <TabsTrigger value="php" className="h-full rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-[#2161ed] data-[state=active]:shadow-none">PHP</TabsTrigger>
                                        <TabsTrigger value="curl" className="h-full rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-[#2161ed] data-[state=active]:shadow-none">cURL</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="javascript" className="mt-0 min-h-0 flex-1"><CodeSnippet language="JavaScript" code={fullJsCode} /></TabsContent>
                                    <TabsContent value="python" className="mt-0 min-h-0 flex-1"><CodeSnippet language="Python" code={pythonCode} /></TabsContent>
                                    <TabsContent value="java" className="mt-0 min-h-0 flex-1"><CodeSnippet language="Java" code={javaCode} /></TabsContent>
                                    <TabsContent value="php" className="mt-0 min-h-0 flex-1"><CodeSnippet language="PHP" code={phpCode} /></TabsContent>
                                    <TabsContent value="curl" className="mt-0 min-h-0 flex-1"><CodeSnippet language="cURL" code={curlCode} /></TabsContent>
                                </Tabs>
                            </div>
                        </section>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Legacy workspace kept closed while the new layout is active. */}
            <Dialog modal={false} open={false} onOpenChange={() => undefined}>
                <DialogContent className="flex h-[95vh] max-h-[95vh] w-[95vw] max-w-[95vw] flex-col overflow-hidden rounded-[24px] border-2 border-[#101426] bg-[#f6f5ef] shadow-[10px_10px_0_#101426]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Play className="h-5 w-5" />
                            {selectedTemplate?.name || t("template")}
                        </DialogTitle>
                        <DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                            <span className="flex items-center gap-1">
                                <span className="font-medium text-muted-foreground">{language === "es" ? "Tamaño:" : "Size:"}</span>
                                <span>{selectedTemplate?.width}x{selectedTemplate?.height}px</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="font-medium text-muted-foreground">{language === "es" ? "Capas:" : "Layers:"}</span>
                                <span>{selectedTemplate?.elements?.length || 0}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="font-medium text-muted-foreground">{language === "es" ? "Editado:" : "Edited:"}</span>
                                <span>{getRelativeTime(selectedTemplate?.lastModified, language)}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="font-medium text-muted-foreground">ID:</span>
                                <span className="font-mono text-[10px]">{selectedTemplate?.id}</span>
                            </span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 flex-1 overflow-hidden">
                        {/* Left: Template Elements Form */}
                        <div className="lg:col-span-1 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium">{language === "es" ? "Elementos del Template" : "Template Elements"}</label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={() => {
                                        if (selectedTemplate && Array.isArray(selectedTemplate.elements)) {
                                            const resetLayers = selectedTemplate.elements.reduce((acc, el) => {
                                                acc[el.id] = { ...el, text: el.text || '', src: el.src || '' };
                                                return acc;
                                            }, {} as Record<string, TemplateElement>);
                                            setLayersDataForSnippets(resetLayers);
                                            toast.info(t("reset"));
                                        }
                                    }}
                                >
                                    {t("reset")}
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                {selectedTemplate && Array.isArray(selectedTemplate.elements) && selectedTemplate.elements.length > 0 ? (
                                    selectedTemplate.elements
                                        .filter(el => el.type === 'text' || el.type === 'image')
                                        .map((element) => (
                                            <div key={element.id} className="border rounded-lg p-3 bg-slate-50">
                                                <div className="flex flex-col gap-1 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {element.type === 'text' ? (
                                                            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Texto</span>
                                                        ) : (
                                                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">Imagen</span>
                                                        )}
                                                        <span className="text-sm font-medium text-foreground">{element.name || (language === "es" ? "Sin nombre" : "Unnamed")}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground font-mono break-all">{element.id}</span>
                                                </div>

                                                {element.type === 'text' && (
                                                    <Input
                                                        value={layersDataForSnippets[element.id]?.text || ''}
                                                        onChange={(e) => {
                                                            setLayersDataForSnippets(prev => ({
                                                                ...prev,
                                                                [element.id]: {
                                                                    ...prev[element.id],
                                                                    type: 'text',
                                                                    text: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                        placeholder={language === "es" ? "Ingresa el texto..." : "Enter text..."}
                                                        className="text-sm"
                                                    />
                                                )}

                                                {element.type === 'image' && (
                                                    <Input
                                                        value={layersDataForSnippets[element.id]?.src || layersDataForSnippets[element.id]?.image_url || ''}
                                                        onChange={(e) => {
                                                            setLayersDataForSnippets(prev => ({
                                                                ...prev,
                                                                [element.id]: {
                                                                    ...prev[element.id],
                                                                    type: 'image',
                                                                    src: e.target.value,
                                                                    image_url: e.target.value
                                                                }
                                                            }));
                                                        }}
                                                        placeholder={language === "es" ? "URL de la imagen..." : "Image URL..."}
                                                        className="text-sm"
                                                    />
                                                )}
                                            </div>
                                        ))
                                ) : (
                                    <div className="text-sm text-muted-foreground text-center py-8 border rounded-lg bg-slate-50">
                                        {language === "es"
                                            ? "Este template no tiene elementos editables"
                                            : "This template has no editable elements"}
                                    </div>
                                )}
                            </div>

                            {/* Test Button */}
                            <Button
                                className="w-full bg-[#135bec] hover:bg-[#0d4ad9] text-white mt-3"
                                onClick={handleTestApi}
                                disabled={isTestingApi || !selectedTemplate}
                            >
                                {isTestingApi ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("rendering")}
                                    </>
                                ) : (
                                    <>
                                        {t("run_request")}
                                    </>
                                )}
                            </Button>

                            {/* Status Response */}
                            {apiResponse && (
                                <div className={`text-xs p-3 rounded-md mt-3 ${apiResponse.status === 200 ? 'bg-green-50 text-green-900 border border-green-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-bold">{t("api_status")}: {apiResponse.status}</p>
                                        {apiResponse.generationTime && (
                                            <span className="text-green-600 font-semibold">
                                                {apiResponse.generationTime.toFixed(2)}s
                                            </span>
                                        )}
                                    </div>
                                    <pre className="overflow-x-auto overflow-y-auto max-h-[300px] whitespace-pre-wrap text-xs">{JSON.stringify(apiResponse.data || { error: apiResponse.error }, null, 2)}</pre>
                                </div>
                            )}
                        </div>

                        {/* Middle: Generated Image */}
                        <div className="lg:col-span-1 flex flex-col">
                            <label className="text-sm font-medium mb-2 block">{t("generated_image")}</label>
                            <div className="border rounded-lg flex-1 bg-slate-50 overflow-hidden min-h-[300px] flex items-center justify-center">
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

                        {/* Right: Code Examples Section */}
                        <div className="lg:col-span-1 flex flex-col overflow-hidden min-h-0">
                            <Tabs defaultValue="simple" className="flex flex-col flex-1 min-h-0">
                                <TabsList className="mb-2 flex-shrink-0">
                                    <TabsTrigger value="simple" className="text-xs">{t("simple_code")}</TabsTrigger>
                                    <TabsTrigger value="full" className="text-xs">{t("full_code")}</TabsTrigger>
                                </TabsList>

                                {/* Simple Code - Only Full Request Payload with language tabs */}
                                <TabsContent value="simple" className="flex-1 min-h-0 mt-0">
                                    <Tabs defaultValue="json" className="flex flex-col h-full">
                                        <TabsList className="mb-2 flex-shrink-0 flex flex-wrap">
                                            <TabsTrigger value="json" className="text-xs">JavaScript</TabsTrigger>
                                            <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
                                            <TabsTrigger value="php" className="text-xs">PHP</TabsTrigger>
                                            <TabsTrigger value="java" className="text-xs">Java</TabsTrigger>
                                            <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="json" className="flex-1 min-h-0 mt-0">
                                            <CodeSnippet language="JSON" code={JSON.stringify({
                                                templateId: selectedTemplate?.id || '',
                                                layers: Object.entries(layersDataForSnippets).reduce((acc, [id, el]) => {
                                                    if (el.type === 'text') {
                                                        acc[id] = { text: el.text || '' };
                                                    } else if (el.type === 'image') {
                                                        acc[id] = { image_url: el.src || '' };
                                                    }
                                                    return acc;
                                                }, {} as Record<string, any>)
                                            }, null, 2)} />
                                        </TabsContent>

                                        <TabsContent value="python" className="flex-1 min-h-0 mt-0">
                                            <CodeSnippet language="Python" code={pythonCode} />
                                        </TabsContent>

                                        <TabsContent value="php" className="flex-1 min-h-0 mt-0">
                                            <CodeSnippet language="PHP" code={phpCode} />
                                        </TabsContent>

                                        <TabsContent value="java" className="flex-1 min-h-0 mt-0">
                                            <CodeSnippet language="Java" code={javaCode} />
                                        </TabsContent>

                                        <TabsContent value="curl" className="flex-1 min-h-0 mt-0">
                                            <CodeSnippet language="cURL" code={curlCode} />
                                        </TabsContent>
                                    </Tabs>
                                </TabsContent>

                                {/* Full Code - Complete examples with all languages */}
                                <TabsContent value="full" className="flex-1 min-h-0 mt-0">
                                    <Tabs defaultValue="javascript" className="flex flex-col h-full">
                                        <TabsList className="mb-2 flex-shrink-0 flex flex-wrap">
                                            <TabsTrigger value="javascript" className="text-xs">JavaScript</TabsTrigger>
                                            <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
                                            <TabsTrigger value="php" className="text-xs">PHP</TabsTrigger>
                                            <TabsTrigger value="java" className="text-xs">Java</TabsTrigger>
                                            <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="javascript" className="flex-1 min-h-0 mt-0">
                                            <CodeSnippet language="JavaScript" code={fullJsCode} />
                                        </TabsContent>

                                        <TabsContent value="python" className="flex-1 min-h-0 mt-0">
                                            <CodeSnippet language="Python" code={fullPythonCode} />
                                        </TabsContent>

                                        <TabsContent value="php" className="flex-1 min-h-0 mt-0">
                                            <CodeSnippet language="PHP" code={fullPhpCode} />
                                        </TabsContent>

                                        <TabsContent value="java" className="flex-1 min-h-0 mt-0">
                                            <CodeSnippet language="Java" code={fullJavaCode} />
                                        </TabsContent>

                                        <TabsContent value="curl" className="flex-1 min-h-0 mt-0">
                                            <CodeSnippet language="cURL" code={fullCurlCode} />
                                        </TabsContent>
                                    </Tabs>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ApiIntegrationPage() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname === "/api-integration") {
            router.replace(`/playground${window.location.search}`);
        }
    }, [pathname, router]);

    return (
        <Suspense fallback={<BrandLoading label="" className="min-h-[70vh] border-0 bg-transparent" />}>
            <ApiIntegrationContent />
        </Suspense>
    );
}
