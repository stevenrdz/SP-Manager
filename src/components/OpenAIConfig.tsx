"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, CheckCircle, XCircle, Loader2, Key, Save } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function OpenAIConfig() {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [isValidated, setIsValidated] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testPrompt, setTestPrompt] = useState("Explica qué es un procedimiento almacenado en SQL Server");
  const [testResponse, setTestResponse] = useState<React.ReactNode>("");
  const [generating, setGenerating] = useState(false);
  const { showToast } = useToast();

  // Available OpenAI models
  const availableModels = [
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Recomendado - Gratis)", tier: "free" },
    { value: "gpt-4o", label: "GPT-4o (Más potente)", tier: "paid" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo", tier: "paid" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Legacy)", tier: "paid" },
    { value: "o1-mini", label: "O1 Mini (Razonamiento)", tier: "paid" },
    { value: "o1", label: "O1 (Razonamiento avanzado)", tier: "paid" },
  ];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/config");
      if (response.ok) {
        const data = await response.json();
        if (data.openai) {
          setSelectedModel(data.openai.model || "gpt-4o-mini");
          setIsSaved(data.openai.hasApiKey || false);
          setIsValidated(data.openai.hasApiKey || false);
        }
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
  };

  const handleValidate = async () => {
    setTesting(true);

    try {
      const response = await fetch("/api/config/openai/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();
      const success = response.ok;

      if (success) {
        showToast("API Key válida", "success");
        setIsValidated(true);
      } else {
        showToast(data.message || "API Key inválida", "error");
        setIsValidated(false);
      }
    } catch (error) {
      showToast("Error al validar la API Key", "error");
      setIsValidated(false);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!isValidated) {
      showToast("Primero debes validar la API Key", "error");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/config/openai/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, model: selectedModel }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Configuración de OpenAI guardada exitosamente", "success");
        setIsSaved(true);
        setApiKey(""); // Clear for security
      } else {
        showToast(data.error || "Error al guardar configuración", "error");
      }
    } catch (error) {
      showToast("Error de red al guardar configuración", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestPrompt = async () => {
    if (!isSaved && !apiKey) {
      showToast("Primero debes guardar tu API Key", "error");
      return;
    }

    setGenerating(true);
    setTestResponse("");

    try {
      const response = await fetch("/api/config/openai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: testPrompt,
          apiKey: apiKey || undefined,
          model: selectedModel
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setTestResponse(data.response);
      } else {
        if (data.link) {
          const content = (
            <div className="space-y-2">
              <p className="text-red-600 font-bold">{data.error}</p>
              <p className="text-[10px] leading-tight">{data.details}</p>
              <a 
                href={data.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full py-1.5 bg-red-500 text-white rounded text-[10px] font-bold"
              >
                Actualizar Saldo
              </a>
            </div>
          );
          setTestResponse(content);
        } else {
          const errorMsg = `Error: ${data.error || "No se pudo generar respuesta"}${data.details ? `\n\nDetalle: ${data.details}` : ""}`;
          setTestResponse(errorMsg);
        }
      }
    } catch (error) {
      showToast("Error de red al probar el prompt", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleRemove = async () => {
    // For now, just clear local state
    // In the future, you could add a DELETE endpoint
    setApiKey("");
    setIsValidated(false);
    setIsSaved(false);
    setTestResponse("");
    showToast("Configuración eliminada localmente", "info");
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Configuración de OpenAI
            {isSaved && (
              <span className="ml-auto text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Configurada
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Key className="h-3 w-3" />
              API Key
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setApiKey(e.target.value);
                setIsValidated(false);
            }}
            placeholder={isSaved ? "••••••••" : "sk-..."}
            className="mt-1 font-mono text-xs"
          />
          {isSaved && !apiKey && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Deja en blanco para mantener la API Key actual
            </p>
          )}
        </div>

          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Modelo
            </label>
            <select
              value={selectedModel}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setSelectedModel(e.target.value);
              }}
              className="mt-1 w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {availableModels.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {selectedModel.includes("mini") || selectedModel.includes("4o") 
                ? "✓ Disponible en plan gratuito" 
                : "⚠️ Requiere plan de pago"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleValidate}
              disabled={testing || !apiKey}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                "Validar"
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !isValidated}
              size="sm"
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-2" />
                  Guardar
                </>
              )}
            </Button>
            {isSaved && (
              <Button onClick={handleRemove} variant="destructive" size="sm">
                Eliminar
              </Button>
            )}
          </div>

          {(isSaved || isValidated) && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Probar Prompt
              </label>
              <Textarea
                value={testPrompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTestPrompt(e.target.value)}
                placeholder="Escribe un prompt de prueba..."
                className="mt-1 text-xs"
                rows={2}
              />
              <Button
                onClick={handleTestPrompt}
                disabled={generating || !testPrompt}
                size="sm"
                className="mt-2 w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-2" />
                    Probar
                  </>
                )}
              </Button>

              {testResponse && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Respuesta:</p>
                  <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{testResponse}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
