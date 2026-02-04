"use client";

import React, { useState } from "react";
import { DatabaseConfig } from "./DatabaseConfig";
import { OpenAIConfig } from "./OpenAIConfig";
import { SecurityConfig } from "./SecurityConfig";
import { ChevronDown, ChevronRight, Database, Sparkles, ShieldCheck } from "lucide-react";

export function Configuration() {
  const [dbOpen, setDbOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);
  const [securityOpen, setSecurityOpen] = useState(true);

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
      <div className="border-b border-gray-100 dark:border-gray-700">
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

      {/* Security Configuration */}
      <div>
        <button
          onClick={() => setSecurityOpen(!securityOpen)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-green-500" size={20} />
            <span className="text-base font-semibold dark:text-white">Seguridad</span>
          </div>
          {securityOpen ? (
            <ChevronDown className="text-gray-400" size={18} />
          ) : (
            <ChevronRight className="text-gray-400" size={18} />
          )}
        </button>
        {securityOpen && <SecurityConfig />}
      </div>
    </div>
  );
}
