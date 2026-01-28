"use client";

import React, { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { StoredProcedureDefinition, SPMetadata } from "@/domain/entities";
import { X, Plus, Search, Sparkles, Loader2, Download } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface SPDetailProps {
  database: string;
  spIdentifier: string; // schema.name
}

interface FullDetail extends StoredProcedureDefinition {
  metadata: SPMetadata;
}

export function SPDetail({ database, spIdentifier }: SPDetailProps) {
  const [data, setData] = useState<FullDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [keyValid, setKeyValid] = useState(false);
  const [verifyingKey, setVerifyingKey] = useState(false);
  const [keyMessage, setKeyMessage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { showToast } = useToast();
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  // Check if OpenAI is configured from localStorage
  const [hasOpenAIConfigured, setHasOpenAIConfigured] = useState(false);

  // Edit State
  const [desc, setDesc] = useState("");
  const [projectTags, setProjectTags] = useState<string[]>([]);
  const [projectInput, setProjectInput] = useState("");
  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Parse spIdentifier - handle both formats:
  // 1. "schema.name" (from sidebar)
  // 2. "database::schema.name" (from projects view)
  let schema: string;
  let name: string;
  
  if (spIdentifier.includes("::")) {
    // Format: "database::schema.name"
    const [, schemaAndName] = spIdentifier.split("::");
    const parts = schemaAndName.split(".");
    schema = parts.length > 1 ? parts[0] : "dbo";
    name = parts.length > 1 ? parts.slice(1).join(".") : parts[0];
  } else {
    // Format: "schema.name"
    const parts = spIdentifier.split(".");
    schema = parts.length > 1 ? parts[0] : "dbo";
    name = parts.length > 1 ? parts.slice(1).join(".") : parts[0];
  }

  const fetchDetail = async () => {
    setLoading(true);
    try {
      // Create composite ID with proper UTF-8 encoding for Unicode characters
      const jsonStr = JSON.stringify({ db: database, schema, name });
      const compositeId = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
      const res = await fetch(`/api/sp-detail/${compositeId}`);
      
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setDesc(json.metadata.description || "");
        setProjectTags(json.metadata.projectReferences || []);
      } else {
        console.error("Error fetching detail:", res.status, res.statusText);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const json = await res.json();
        setAllProjects(json);
      }
    } catch (err) {
      console.error("Error fetching all projects:", err);
    }
  };

  useEffect(() => {
    if (database && schema && name) {
        fetchDetail();
    }
    fetchAllProjects();

    // Check if OpenAI is configured
    const checkOpenAIConfig = () => {
      const apiKey = localStorage.getItem("openai_api_key");
      const validated = localStorage.getItem("openai_validated") === "true";
      setHasOpenAIConfigured(!!(apiKey && validated));
    };
    checkOpenAIConfig();
  }, [database, spIdentifier]);

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const newMeta = {
        ...data.metadata,
        description: desc,
        projectReferences: projectTags,
      };

      // Create composite ID with proper UTF-8 encoding for Unicode characters
      const jsonStr = JSON.stringify({ db: database, schema, name });
      const compositeId = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
      
      await fetch(
        `/api/sp-detail/${compositeId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMeta),
        }
      );

      // Refresh suggestions in case a new project was added
      fetchAllProjects();
      // Refresh
      fetchDetail();
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!hasOpenAIConfigured || !data) return;

    setAnalyzing(true);
    setAiAnalysis("");

    try {
      const apiKey = localStorage.getItem("openai_api_key");
      const model = localStorage.getItem("openai_model") || "gpt-4o-mini";

      const prompt = `Analiza el siguiente procedimiento almacenado de SQL Server y proporciona:
1. Un resumen de qué hace
2. Los parámetros que recibe y su propósito
3. Las tablas principales que utiliza
4. Posibles mejoras o consideraciones

Nombre: ${data.schema}.${data.name}
Definición:
${data.definition || "No disponible"}`;

      const response = await fetch("/api/config/openai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          apiKey,
          model
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setAiAnalysis(result.response);
        showToast("Análisis completado", "success");
      } else {
        if (response.status === 429 && result.link) {
          showToast(
            <div className="flex flex-col gap-1">
              <span className="font-bold">Cuota de OpenAI excedida</span>
              <span className="text-xs">{result.details}</span>
              <a 
                href={result.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white bg-red-500 px-2 py-1 rounded mt-1 text-center font-bold"
              >
                Actualizar saldo
              </a>
            </div>,
            "error",
            10000 // 10 seconds for this critical error
          );
        } else {
          showToast(`Error: ${result.error || "No se pudo analizar"}`, "error");
        }
      }
    } catch (error: any) {
      showToast("Error de red al analizar con IA", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleVerifyKey = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    setVerifyingKey(true);
    setKeyMessage(null);
    setKeyValid(false);
    try {
      const res = await fetch("/api/openai/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.valid) {
        setKeyValid(true);
        setKeyMessage("API key válida.");
      } else {
        setKeyValid(false);
        setKeyMessage("API key inválida o sin permisos.");
      }
    } catch (e) {
      console.error(e);
      setKeyValid(false);
      setKeyMessage("No se pudo verificar la API key.");
    } finally {
      setVerifyingKey(false);
    }
  };


  const addProjectTag = (project: string) => {
    const trimmed = project.trim();
    if (trimmed && !projectTags.includes(trimmed)) {
      setProjectTags((prev: string[]) => [...prev, trimmed]);
    }
    setProjectInput("");
    setShowSuggestions(false);
  };

  const removeProjectTag = (project: string) => {
    const trimmed = project.trim();
    setProjectTags((prev: string[]) => prev.filter((t: string) => t !== trimmed));
    showToast(`Proyecto "${trimmed}" eliminado`, "info");
  };

  const startEditingProject = (project: string) => {
    setEditingProject(project);
    setEditingValue(project);
  };

  const saveEditingProject = () => {
    if (!editingProject) return;
    const trimmed = editingValue.trim();
    if (trimmed && trimmed !== editingProject && !projectTags.includes(trimmed)) {
      setProjectTags((prev: string[]) => prev.map((p: string) => p === editingProject ? trimmed : p));
    }
    setEditingProject(null);
    setEditingValue("");
  };

  const cancelEditingProject = () => {
    setEditingProject(null);
    setEditingValue("");
  };

  const filteredSuggestions = allProjects.filter((p: string) => 
    p.toLowerCase().includes(projectInput.toLowerCase()) && 
    !projectTags.includes(p)
  );

  const handleExportSQL = () => {
    if (!data) return;
    
    // Create file content
    const content = data.definition || '';
    
    // Create blob
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.schema}.${data.name}.sql`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast(`Archivo ${data.schema}.${data.name}.sql descargado`, "success");
  };

  if (loading) return <div>Cargando detalle...</div>;
  if (!data) return <div>Seleccione un SP</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 break-all">
          {data.schema}.{data.name}
        </h2>
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            {hasOpenAIConfigured ? (
              <Button variant="secondary" onClick={handleAnalyzeWithAI} disabled={analyzing || saving} className="flex-1 sm:flex-none">
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analizar con IA
                  </>
                )}
              </Button>
            ) : null}
            <Button onClick={handleSave} disabled={saving || analyzing} className="flex-1 sm:flex-none">
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.metadata.projectReferences.map((p: string) => (
          <Badge key={p} variant="secondary">
            {p}
          </Badge>
        ))}
      </div>

      <Tabs defaultValue="doc" className="w-full">
        <TabsList>
          <TabsTrigger value="doc">Documentación</TabsTrigger>
          <TabsTrigger value="code">Código SQL</TabsTrigger>
          <TabsTrigger value="meta">Metadatos</TabsTrigger>
          {aiAnalysis && <TabsTrigger value="ai">Análisis IA</TabsTrigger>}
        </TabsList>

        <TabsContent value="doc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Descripción General</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={10}
                className="font-mono text-sm"
                placeholder="Escriba la documentación aquí o use 'Analizar con IA' para generarla automágicamente..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proyectos Relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-500 rounded p-2 border border-blue-500">
                <div className="flex flex-wrap gap-2 mb-2">
                    {projectTags.length > 0 ? (
                        projectTags.map((p: string) => (
                            <div key={p}>
                                {editingProject === p ? (
                                    <Input
                                        value={editingValue}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingValue(e.target.value)}
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                saveEditingProject();
                                            } else if (e.key === 'Escape') {
                                                cancelEditingProject();
                                            }
                                        }}
                                        onBlur={saveEditingProject}
                                        autoFocus
                                        className="h-8 w-32 text-sm"
                                    />
                                ) : (
                                    <Badge 
                                        variant="default" 
                                        className="flex items-center gap-1.5 px-3 py-1 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 cursor-pointer"
                                        onDoubleClick={() => startEditingProject(p)}
                                        title="Doble clic para editar"
                                    >
                                        {p}
                                        <button 
                                            onClick={(e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                removeProjectTag(p);
                                            }}
                                            className="hover:text-red-600 transition-colors"
                                            title="Eliminar"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </Badge>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm italic text-gray-400">No hay proyectos vinculados.</p>
                    )}
                </div>

                <div className="relative" ref={suggestionRef}>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                value={projectInput}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setProjectInput(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addProjectTag(projectInput);
                                    }
                                }}
                                placeholder="Buscar o añadir proyecto..."
                                className="pl-9"
                            />
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => addProjectTag(projectInput)}
                            disabled={!projectInput.trim()}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Añadir
                        </Button>
                    </div>

                    {showSuggestions && projectInput.trim() && filteredSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredSuggestions.map((suggestion: string) => (
                                <button
                                    key={suggestion}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                    onClick={() => addProjectTag(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <p className="text-xs text-gray-500">
                  <strong>Tip:</strong> Haz doble clic en un proyecto para editarlo. Presiona Enter o el botón "+" para añadir uno nuevo. Presiona Escape para cancelar la edición.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Código SQL</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportSQL}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar SQL
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <pre className="rounded-md bg-gray-100 p-4 text-xs text-gray-800 dark:bg-gray-900/80 dark:text-gray-100 overflow-x-auto">
                {data.definition}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta">
          <Card>
            <CardContent className="space-y-2 pt-4">
              <div>
                <strong>Tablas Usadas (Detectadas):</strong>
              </div>
              <ul className="list-disc pl-5">
                {data.metadata.tablesUsed.length ? (
                  data.metadata.tablesUsed.map((t: string) => <li key={t}>{t}</li>)
                ) : (
                  <li>Ninguna detectada</li>
                )}
              </ul>
              <div>
                <strong>Último Escaneo:</strong>{" "}
                {new Date(data.metadata.lastScanDate).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {aiAnalysis && (
          <TabsContent value="ai">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-md font-bold">Análisis Inteligente</CardTitle>
                <Sparkles className="h-4 w-4 text-brand-500" />
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    {aiAnalysis}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                        setDesc((prev: string) => prev ? `${prev}\n\n---\n### Análisis IA\n${aiAnalysis}` : aiAnalysis);
                        // Also update full data object to reflect other possible changes
                        setData((prev: FullDetail | null) => prev ? { ...prev, metadata: { ...prev.metadata, description: aiAnalysis } } : null);
                        showToast("Análisis copiado a la documentación. No olvides guardar los cambios.", "info");
                    }}
                  >
                    Usar como descripción
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

