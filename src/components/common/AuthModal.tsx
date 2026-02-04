"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { validateAdminApiKey } from "@/lib/api";

const AuthModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleAuthError = () => {
      setIsOpen(true);
    };

    window.addEventListener("auth_error", handleAuthError);
    return () => window.removeEventListener("auth_error", handleAuthError);
  }, []);

  const handleValidate = async () => {
    if (!key.trim()) return;
    
    setIsValidating(true);
    setError(null);
    
    const isValid = await validateAdminApiKey(key);
    
    if (isValid) {
      localStorage.setItem("admin_api_key", key);
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setKey("");
        // Optional: reload or retry action
        window.location.reload();
      }, 1500);
    } else {
      setError("Clave de administrador inválida. Por favor, verifica e intenta de nuevo.");
    }
    setIsValidating(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-gray-900 dark:text-white">
            Autenticación Requerida
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 dark:text-gray-400">
            Esta acción requiere privilegios de administrador. Por favor ingresa la Admin API Key.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Introduce tu Admin key..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-2">
                <CheckCircle2 size={16} />
                <span>¡Autenticado con éxito! Reiniciando...</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            type="button"
            onClick={handleValidate}
            disabled={isValidating || !key.trim() || success}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 transition-all"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              "Validar y Continuar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
