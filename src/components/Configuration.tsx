"use client";

import React, { useState } from "react";
import { DatabaseConfig } from "./DatabaseConfig";
import { OpenAIConfig } from "./OpenAIConfig";
import { ChevronDown, ChevronRight, Database, Sparkles, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function Configuration() {
  const [dbOpen, setDbOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemo) {
    return (
      <div className="p-6">
        <Alert className="mb-6 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <AlertTitle className="text-amber-800 dark:text-amber-400">Modo Demo</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            La configuración está deshabilitada en el modo demo. La aplicación está usando datos de prueba simulados.
          </AlertDescription>
        </Alert>
        
        <div className="opacity-60 pointer-events-none">
          <div className="border-b border-gray-100 dark:border-gray-700">
            <button className="w-full flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Database className="text-gray-400" size={20} />
                <span className="text-base font-semibold dark:text-white">Base de Datos</span>
              </div>
              <ChevronDown className="text-gray-400" size={18} />
            </button>
            <div className="p-6 text-sm text-gray-500">Configuración bloqueada</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Database Configuration */}
      <div className="border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setDbOpen(!dbOpen)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Database className="text-blue-500" size={20} />
            <span className="text-base font-semibold dark:text-white">Base de Datos</span>
          </div>
          {dbOpen ? (
            <ChevronDown className="text-gray-400" size={18} />
          ) : (
            <ChevronRight className="text-gray-400" size={18} />
          )}
        </button>
        {dbOpen && <DatabaseConfig />}
      </div>

      {/* OpenAI Configuration */}
      <div>
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="text-purple-500" size={20} />
            <span className="text-base font-semibold dark:text-white">OpenAI</span>
          </div>
          {aiOpen ? (
            <ChevronDown className="text-gray-400" size={18} />
          ) : (
            <ChevronRight className="text-gray-400" size={18} />
          )}
        </button>
        {aiOpen && <OpenAIConfig />}
      </div>
    </div>
  );
}
