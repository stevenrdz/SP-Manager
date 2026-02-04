"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableData } from "@/domain/entities";
import { Loader2, Table as TableIcon, Database, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: string;
  database: string;
}

export function TableInfoModal({ isOpen, onClose, tableName, database }: TableInfoModalProps) {
  const [data, setData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && tableName) {
      fetchTableData();
    }
  }, [isOpen, tableName]);

  const fetchTableData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Split tableName if it has schema
      const parts = tableName.split('.');
      const schema = parts.length > 1 ? parts[0] : 'dbo';
      const name = parts.length > 1 ? parts.slice(1).join('.') : parts[0];

      const res = await fetch(`/api/table/${database}/${schema}/${name}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError("No se pudo obtener la información de la tabla.");
      }
    } catch (err) {
      setError("Error de conexión al obtener datos de la tabla.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TableIcon className="h-5 w-5 text-blue-500" />
            Tabla: {tableName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">Consultando base de datos...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : data ? (
          <Tabs defaultValue="columns" className="flex-1 overflow-hidden flex flex-col">
            <TabsList>
              <TabsTrigger value="columns">Columnas</TabsTrigger>
              <TabsTrigger value="data">Muestra de Datos (JSON)</TabsTrigger>
              <TabsTrigger value="raw">Metadata Bruta</TabsTrigger>
            </TabsList>

            <TabsContent value="columns" className="flex-1 overflow-auto mt-4">
              <div className="border rounded-md">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                    <TableRow>
                      <TableHead>Columna</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>PK</TableHead>
                      <TableHead>Nullable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.columns.map((col) => (
                      <TableRow key={col.name}>
                        <TableCell className="font-mono font-bold text-gray-900 dark:text-gray-100">{col.name}</TableCell>
                        <TableCell>{col.type}({col.maxLength})</TableCell>
                        <TableCell>{col.isPrimaryKey ? "✅" : ""}</TableCell>
                        <TableCell>{col.isNullable ? "SÍ" : "NO"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="data" className="flex-1 overflow-auto mt-4 bg-gray-900 rounded-md p-4">
              <pre className="text-xs text-green-400 font-mono">
                {JSON.stringify(data.sampleData, null, 2)}
              </pre>
            </TabsContent>

            <TabsContent value="raw" className="flex-1 overflow-auto mt-4 bg-gray-50 dark:bg-gray-900 p-4 border rounded-md">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Database className="h-4 w-4" />
                        <span>Base de datos: <strong>{data.database}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Info className="h-4 w-4" />
                        <span>Esquema: <strong>{data.schema}</strong></span>
                    </div>
                    <pre className="text-xs font-mono text-gray-500 mt-4">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
