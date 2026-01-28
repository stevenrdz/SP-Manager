"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface SP {
  name: string;
  schema: string;
  database: string;
  objectId: number;
}

export function SPList({ database }: { database: string }) {
  const [sps, setSps] = useState<SP[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchSps = async () => {
    setLoading(true);
    try {
      const q = search ? `&q=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/sps?db=${encodeURIComponent(database)}${q}`);
      const data = await res.json();
      setSps(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (database) fetchSps();
  }, [database]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSps();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Buscar Procedimiento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          Buscar
        </Button>
      </form>

      <div className="rounded-md border border-gray-200 dark:border-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Esquema</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sps.map((sp) => (
              <TableRow
                key={sp.objectId}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
                onClick={() => router.push(`/?db=${database}&sp=${sp.schema}.${sp.name}`)}
              >
                <TableCell>{sp.schema}</TableCell>
                <TableCell className="font-medium">{sp.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">Ver Detalle</Badge>
                </TableCell>
              </TableRow>
            ))}
            {sps.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
