"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useSidebar } from "@/context/SidebarContext";
import { useScanning } from "@/context/ScanningContext";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu, Download } from "lucide-react";

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { isScanning, scanProgress, triggerScan } = useScanning();
  const [dbs, setDbs] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = searchParams.get('db') || '';

  useEffect(() => {
    fetch('/api/databases')
      .then(res => res.json())
      .then(data => setDbs(data))
      .catch(err => console.error(err));
  }, []);

  const handleDbChange = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val === 'all') {
      params.delete('db');
    } else {
      params.set('db', val);
    }
    params.delete('sp');
    router.push(`/?${params.toString()}`);
  };

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const handleExport = () => {
    if (!db) return;
    window.open(`/api/backup/export?db=${encodeURIComponent(db)}`, '_blank');
  };



  const percentage = scanProgress.total > 0 ? Math.round((scanProgress.current / scanProgress.total) * 100) : 0;

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-50 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col flex-1 lg:flex-row lg:px-6">
        <div className="flex h-16 items-center justify-between w-full gap-4 px-4 border-b border-gray-200 dark:border-gray-800 lg:justify-between lg:border-b-0 lg:px-0">
          
          <div className="flex items-center gap-4">
            <button
              className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg dark:border-gray-800 dark:text-gray-400 lg:block hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>

            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent hidden sm:block">
              SQL Manager
            </h1>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            {isScanning && (
               <div className="hidden md:flex flex-col w-48 mr-4">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Procesando...</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-500 transition-all duration-300 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                 </div>
               </div>
            )}

            <Select value={db} onValueChange={handleDbChange} disabled={isScanning}>
              <SelectTrigger className="w-[180px] h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <SelectValue className="truncate" placeholder="Base de Datos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Bases de Datos</SelectItem>
                {dbs.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button 
                onClick={triggerScan} 
                disabled={!db || isScanning}
                className="bg-brand-500 hover:bg-brand-600 text-white"
            >
              {isScanning ? 'Escaneando...' : 'Sincronizar'}
            </Button>

            <Button
              onClick={handleExport}
              disabled={!db}
              variant="outline"
              size="icon"
              title="Exportar Backup"
            >
              <Download size={20} />
            </Button>
            
            <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1"></div>

            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
