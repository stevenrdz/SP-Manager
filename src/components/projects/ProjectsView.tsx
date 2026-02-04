"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SPMetadata } from '@/domain/entities';

interface SPCardProps {
  sp: SPMetadata;
  onClick: () => void;
}

const SPCard: React.FC<SPCardProps> = ({ sp, onClick }) => {
  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return 'Sin descripción';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-brand-500 hover:shadow-md transition-all duration-200"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors break-all">
          {sp.spName}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium">{sp.database}</span>
          <span>•</span>
          <span>{sp.schema}</span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {truncateText(sp.description, 120)}
        </p>

        {sp.projectReferences && sp.projectReferences.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {sp.projectReferences.slice(0, 3).map((project: string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded"
              >
                {project}
              </span>
            ))}
            {sp.projectReferences.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                +{sp.projectReferences.length - 3}
              </span>
            )}
          </div>
        )}

        {sp.tablesUsed && sp.tablesUsed.length > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tablas: {sp.tablesUsed.slice(0, 3).join(', ')}
            {sp.tablesUsed.length > 3 && ` +${sp.tablesUsed.length - 3}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ProjectsView() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState<string[]>([]);
  const [sps, setSps] = useState<SPMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch all projects for autocomplete
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error('Error fetching projects:', err));
  }, []);

  // Fetch SPs when project name changes (with debounce)
  useEffect(() => {
    if (!projectName.trim()) {
      setSps([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/projects/${encodeURIComponent(projectName)}/sps`)
        .then(res => res.json())
        .then(data => {
          setSps(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching SPs:', err);
          setSps([]);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [projectName]);

  const filteredProjects = projects.filter(p =>
    p.toLowerCase().includes(projectName.toLowerCase())
  );

  const handleSPClick = (sp: SPMetadata) => {
    // Only pass schema.name since db is already in the db parameter
    const spIdentifier = `${sp.schema}.${sp.spName}`;
    router.push(`/?db=${encodeURIComponent(sp.database)}&sp=${encodeURIComponent(spIdentifier)}`);
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Proyectos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Busca stored procedures por nombre de proyecto
        </p>
      </div>

      <div className="relative mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Buscar proyecto..."
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>

        {showSuggestions && projectName && filteredProjects.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredProjects.map((project, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setProjectName(project);
                  setShowSuggestions(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm"
              >
                {project}
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-brand-500" size={32} />
        </div>
      )}

      {!loading && projectName && sps.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No se encontraron stored procedures para el proyecto "{projectName}"
        </div>
      )}

      {!loading && sps.length > 0 && (
        <div>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {sps.length} stored procedure{sps.length !== 1 ? 's' : ''} encontrado{sps.length !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sps.map((sp, idx) => (
              <SPCard
                key={`${sp.database}-${sp.schema}-${sp.spName}-${idx}`}
                sp={sp}
                onClick={() => handleSPClick(sp)}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && !projectName && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Ingresa un nombre de proyecto para buscar
        </div>
      )}
    </div>
  );
}
