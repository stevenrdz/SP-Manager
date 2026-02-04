import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Database, CheckCircle, XCircle, Loader2, Save, Server } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function DatabaseConfig() {
  const [type, setType] = useState<string>("sqlserver");
  const [server, setServer] = useState("");
  const [database, setDatabase] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [port, setPort] = useState("1433");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const { showToast } = useToast();

  // Load configuration on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/config");
      if (response.ok) {
        const data = await response.json();
        if (data.database) {
          setType(data.database.type || "sqlserver");
          setServer(data.database.server || "");
          setDatabase(data.database.database || "");
          setUsername(data.database.user || "");
          setPort(data.database.port?.toString() || "1433");
          setIsConfigured(true);
        }
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetchWithAuth("/api/config/database/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ server, database, username, password }),
      });

      const data = await response.json();
      setTestResult({
        success: response.ok,
        message: data.message || (response.ok ? "Conexión exitosa" : "Error al conectar"),
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: "Error de red al probar la conexión",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await fetchWithAuth("/api/config/database/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          server,
          database,
          user: username,
          password,
          port: parseInt(port),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Configuración guardada exitosamente", "success");
        setIsConfigured(true);
        // Clear password field for security
        setPassword("");
      } else {
        showToast(data.error || "Error al guardar configuración", "error");
      }
    } catch (error) {
      showToast("Error de red al guardar configuración", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" />
            Configuración de Base de Datos
            {isConfigured && (
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
              <Server className="h-3 w-3" />
              Tipo de Base de Datos
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="sqlserver">Microsoft SQL Server</option>
              <option value="postgresql" disabled>PostgreSQL (Próximamente)</option>
              <option value="mysql" disabled>MySQL (Próximamente)</option>
              <option value="oracle" disabled>Oracle (Próximamente)</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Actualmente solo SQL Server está soportado
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Servidor</label>
            <Input
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder="localhost o IP del servidor"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Base de Datos</label>
              <Input
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                placeholder="nombre_bd"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Puerto</label>
              <Input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="1433"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Usuario</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isConfigured ? "••••••••" : "contraseña"}
              className="mt-1"
            />
            {isConfigured && !password && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Deja en blanco para mantener la contraseña actual
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleTestConnection}
              disabled={testing || !server || !database}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Probando...
                </>
              ) : (
                "Probar Conexión"
              )}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || !server || !database || !username}
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
          </div>

          {testResult && (
            <div
              className={`flex items-center gap-2 p-2 rounded text-xs ${
                testResult.success
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {testResult.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
