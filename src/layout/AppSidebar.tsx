"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useScanning } from "@/context/ScanningContext";

import {
  FileCode,
  Search,
  Database,
  ChevronRight,
  BarChart3,
  Settings,
  FolderKanban,
  BookOpen
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface SP {
  name: string;
  schema: string;
  database: string;
  objectId: number;
  snippet?: string;
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const searchParams = useSearchParams();
  const db = searchParams.get('db');
  
  const [sps, setSps] = useState<SP[]>([]);
  const [search, setSearch] = useState('');
  const [searchMode, setSearchMode] = useState<'name' | 'code'>('name');
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  // Reset visible count when database or search changes, so we start fresh
  useEffect(() => {
    setVisibleCount(20);
  }, [db, search, searchMode]);

  const fetchSps = async () => {
    if (!db && !search) {
      setSps([]);
      return;
    }
    setLoading(true);
    try {
      const dbParam = db ? `db=${encodeURIComponent(db)}&` : '';
      const qParam = search ? `q=${encodeURIComponent(search)}&` : '';
      const modeParam = `mode=${searchMode}`;
      const res = await fetch(`/api/sps?${dbParam}${qParam}${modeParam}`);
      if (res.ok) {
        const data = await res.json();
        setSps(data);
      } else {
        setSps([]);
      }
    } catch(e) {
      console.error(e);
      setSps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSps();
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [db, search, searchMode]);

  return (
    <aside
      className={`fixed lg:relative mt-16 flex flex-col lg:mt-0 top-0 px-0 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-[width,transform] duration-150 ease-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex h-16 items-center border-b border-gray-100 dark:border-gray-800 ${
          isExpanded || isHovered || isMobileOpen ? "justify-start px-4 lg:px-6" : "justify-center"
        }`}
      >
        <Link href="/" className="flex items-center gap-2">
          <Database className="text-brand-500" size={24} />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-xl font-bold dark:text-white">SP Manager</span>
          )}
        </Link>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Dashboard Link */}
        <Link 
          href="/"
          className="flex items-center gap-3 px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-500 dark:hover:text-brand-400 transition-colors border-b border-gray-100 dark:border-gray-800 group"
        >
          <BarChart3 size={20} className="shrink-0 group-hover:text-brand-500" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-sm font-medium">Dashboard</span>
          )}
        </Link>

        {/* Projects Link */}
        <Link 
          href="/?view=projects"
          className="flex items-center gap-3 px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-500 dark:hover:text-brand-400 transition-colors border-b border-gray-100 dark:border-gray-800 group"
        >
          <FolderKanban size={20} className="shrink-0 group-hover:text-brand-500" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-sm font-medium">Proyectos</span>
          )}
        </Link>

        {/* Configuration Link */}
        <Link 
          href="/?view=config"
          className="flex items-center gap-3 px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-500 dark:hover:text-brand-400 transition-colors border-b border-gray-100 dark:border-gray-800 group"
        >
          <Settings size={20} className="shrink-0 group-hover:text-brand-500" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-sm font-medium">Configuración</span>
          )}
        </Link>

        {/* Documentation Link */}
        <Link 
          href="/api-docs"
          className="flex items-center gap-3 px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-500 dark:hover:text-brand-400 transition-colors border-b border-gray-100 dark:border-gray-800 group"
        >
          <BookOpen size={20} className="shrink-0 group-hover:text-brand-500" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-sm font-medium">Documentación</span>
          )}
        </Link>

        {/* Search Section */}
        {(isExpanded || isHovered || isMobileOpen) && (
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-brand-500 dark:text-gray-200 placeholder:text-gray-400"
                        placeholder={searchMode === 'name' ? "Buscar SP..." : "Contenido del código..."}
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                </div>
                
                {/* Search Mode Toggle */}
                <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-md">
                  <button
                    onClick={() => setSearchMode('name')}
                    className={`flex-1 text-[10px] font-bold uppercase transition-all py-1 rounded ${
                      searchMode === 'name' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    Nombre
                  </button>
                  <button
                    onClick={() => setSearchMode('code')}
                    className={`flex-1 text-[10px] font-bold uppercase transition-all py-1 rounded ${
                      searchMode === 'code' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    Código
                  </button>
                </div>
            </div>
        )}

        <div 
          className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar"
          onScroll={(e) => {
            const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
            // Use 10px threshold to handle fractional pixels or almost-bottom scroll
            if (scrollHeight - scrollTop - clientHeight < 10) {
              setVisibleCount(prev => Math.min(prev + 20, sps.length));
            }
          }}
        >
            {!db && !search && (isExpanded || isHovered || isMobileOpen) && (
                <div className="text-center text-gray-400 text-sm mt-10 px-2">
                    {searchMode === 'name' 
                      ? "Seleccione una BD o busque un procedimiento globalmente"
                      : "Busque fragmentos de código en todos los procedimientos"}
                </div>
            )}

            {loading && (isExpanded || isHovered || isMobileOpen) && (
                 <div className="text-center text-gray-400 text-sm mt-4">
                    Cargando...
                </div>
            )}

            {!loading && sps.slice(0, visibleCount).map((sp) => (
                <Link 
                    key={`${sp.database}-${sp.schema}-${sp.name}`} 
                    href={`/?db=${sp.database}&sp=${sp.schema}.${sp.name}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-500 dark:hover:text-brand-400 transition-colors group"
                >
                    <FileCode size={18} className="shrink-0 group-hover:text-brand-500 mt-0.5" />
                    {(isExpanded || isHovered || isMobileOpen) && (
                        <div className="flex flex-col truncate w-full">
                            <span className="text-sm font-medium truncate">{sp.name}</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                {sp.database} • {sp.schema}
                            </span>
                            {searchMode === 'code' && sp.snippet && (
                              <div className="text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 mt-1 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-900/30 truncate italic font-mono">
                                {sp.snippet}
                              </div>
                            )}
                        </div>
                    )}
                     {(isExpanded || isHovered || isMobileOpen) && (
                        <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400" />
                     )}
                </Link>
            ))}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
