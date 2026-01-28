'use client';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ApiDoc() {
  const [spec, setSpec] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch('/api/doc')
      .then((res) => res.json())
      .then((data) => setSpec(data));
  }, []);

  // Get deep link parameters
  const db = searchParams.get('db');
  const sp = searchParams.get('sp');

  // Build deep link URL if parameters are provided
  let deepLinkUrl = '';
  if (db && sp) {
    // Try to match the endpoint in Swagger
    // Format: /api/sps/{db}/{schema}/{name}
    const parts = sp.split('.');
    if (parts.length === 2) {
      const [schema, name] = parts;
      deepLinkUrl = `#/Stored%20Procedures/get_api_sps__db___schema___name_`;
    }
  }

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-lg text-gray-700 dark:text-gray-300">Cargando documentación API...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="api-docs-container">
      <SwaggerUI 
        spec={spec}
        deepLinking={true}
        defaultModelsExpandDepth={-1}
        docExpansion="list"
      />
    </div>
  );
}
