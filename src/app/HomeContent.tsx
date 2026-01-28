"use client";

import { SPDetail } from "@/components/sp/SPDetail";
import { Dashboard } from "@/components/Dashboard";
import { Configuration } from "@/components/Configuration";
import ProjectsView from "@/components/projects/ProjectsView";
import { useSearchParams } from "next/navigation";

export default function HomeContent() {
  const searchParams = useSearchParams();

  // URL State
  const db = searchParams.get("db") || "";
  const spIdentifier = searchParams.get("sp");
  const view = searchParams.get("view");

  // Configuration view
  if (view === "config") {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gestiona las credenciales de base de datos y la configuración de OpenAI
            </p>
          </div>
          <Configuration />
        </div>
      </div>
    );
  }

  // Projects view
  if (view === "projects") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <ProjectsView />
      </div>
    );
  }

  if (!db) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[20vh] text-center space-y-4">
          <div className="p-4 rounded-full bg-brand-50 dark:bg-gray-800">
            <svg className="w-12 h-12 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bienvenido a SP Manager</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mt-2">
              Selecciona una base de datos en el menú superior para comenzar a explorar y documentar tus procedimientos almacenados.
            </p>
          </div>
        </div>
        
        {/* Dashboard Section */}
        <Dashboard />
      </div>
    );
  }

  if (!spIdentifier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-400">
        <p>Seleccione un SP de la barra lateral para ver sus detalles</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <SPDetail database={db} spIdentifier={spIdentifier} />
      </div>
    </div>
  );
}
