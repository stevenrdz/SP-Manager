"use client";
import React, { createContext, useContext, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

interface ScanProgress {
  current: number;
  total: number;
}

interface ScanningContextType {
  isScanning: boolean;
  scanProgress: ScanProgress;
  triggerScan: (auto?: boolean) => Promise<void>;
}

const ScanningContext = createContext<ScanningContextType | undefined>(undefined);

export const useScanning = () => {
  const context = useContext(ScanningContext);
  if (!context) {
    throw new Error("useScanning must be used within a ScanningProvider");
  }
  return context;
};

export const ScanningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({ current: 0, total: 0 });
  const searchParams = useSearchParams();
  const db = searchParams.get('db');

  const min = (a: number, b: number) => (a < b ? a : b);

  const triggerScan = async (auto: boolean = false) => {
    if (!db) return;
    if (!auto && !confirm(`¿Iniciar escaneo completo de ${db}? Esto puede tardar.`)) return;

    setIsScanning(true);
    setScanProgress({ current: 0, total: 0 });

    try {
      // 1. Get List of SPs from SQL (Source of Truth)
      const listRes = await fetchWithAuth(`/api/sps?db=${encodeURIComponent(db)}&source=sql`);
      const allSps = await listRes.json();
      
      const total = allSps.length;
      setScanProgress({ current: 0, total });

      if (total === 0) {
        if (!auto) alert("No se encontraron procedimientos almacenados para escanear.");
        setIsScanning(false);
        return;
      }

      // 2. Batch Process
      const BATCH_SIZE = 5;
      let processed = 0;
      let updatedTotal = 0;

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = allSps.slice(i, min(i + BATCH_SIZE, total));
        
        // Use the sync endpoint
        const batchRes = await fetchWithAuth(`/api/sps/${encodeURIComponent(db)}/sync`, {
          method: 'POST',
          body: JSON.stringify({ sps: batch })
        });
        
        if (batchRes.ok) {
           const batchData = await batchRes.json();
           updatedTotal += batchData.updated;
        }

        processed += batch.length;
        setScanProgress({ current: processed, total });
      }

      if (!auto) alert(`Escaneo completo. ${total} procesados, ${updatedTotal} actualizados/creados.`);
    } catch (e) {
      console.error(e);
      alert('Error crítico al escanear');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <ScanningContext.Provider value={{ isScanning, scanProgress, triggerScan }}>
      {children}
    </ScanningContext.Provider>
  );
};
