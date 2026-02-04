"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { validateAdminApiKey } from "@/lib/api";

export function SecurityConfig() {
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });

  useEffect(() => {
    const savedKey = localStorage.getItem("admin_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    setStatus({ type: null, message: "" });
    
    const isValid = await validateAdminApiKey(apiKey);
    
    if (isValid) {
      localStorage.setItem("admin_api_key", apiKey);
      setStatus({ type: 'success', message: "API Key validada y guardada correctamente." });
    } else {
      setStatus({ type: 'error', message: "La API Key no es válida. Verifica el archivo .env del servidor." });
    }
    setIsValidating(false);
  };

  return (
    <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Clave de Administrador</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Esta clave es necesaria para realizar operaciones sensibles como sincronizar bases de datos.
            Se almacena localmente en su navegador.
          </p>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="password"
                placeholder="Introduzca Admin API Key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          {status.type && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              status.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{status.message}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={isValidating || !apiKey.trim()}
              className="bg-brand-500 hover:bg-brand-600 text-white gap-2 h-10 px-6 transition-all"
            >
              {isValidating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Validar y Guardar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
