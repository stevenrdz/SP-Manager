"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileText, CheckCircle, XCircle, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalSPs: number;
  totalByDatabase: { database: string; count: number }[];
  documented: number;
  undocumented: number;
  topProjects: { project: string; count: number }[];
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        Cargando estadísticas...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        No se pudieron cargar las estadísticas
      </div>
    );
  }

  const documentationRate = stats.totalSPs > 0 
    ? Math.round((stats.documented / stats.totalSPs) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Total SPs */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total SPs</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalSPs}</p>
            </div>
            <Database className="h-10 w-10 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Documentation Rate */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">Documentados</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{documentationRate}%</p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">{stats.documented} de {stats.totalSPs}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* By Database */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Por Base de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-2">
            {stats.totalByDatabase.length > 0 ? (
              stats.totalByDatabase.slice(0, 3).map((db) => (
                <div key={db.database} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300 truncate flex-1 font-medium">{db.database}</span>
                  <span className="font-bold text-purple-900 dark:text-purple-100 ml-2">{db.count}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">No hay datos</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Projects */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Proyectos Principales
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-2">
            {stats.topProjects.length > 0 ? (
              stats.topProjects.map((proj) => (
                <div key={proj.project} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300 truncate flex-1 font-medium">{proj.project}</span>
                  <span className="font-bold text-orange-900 dark:text-orange-100 ml-2">{proj.count}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">No hay datos</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
