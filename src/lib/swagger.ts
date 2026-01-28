import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'SP Manager API',
        version: '1.0.0',
        description: `
# SP Manager API Documentation

API completa para gestionar y documentar Stored Procedures de SQL Server.

## Características
- Gestión de configuración de bases de datos
- Búsqueda y documentación de SPs
- Análisis con IA (OpenAI)
- Gestión de proyectos
- Soporte completo para Unicode (tildes, ñ, etc.)
        `,
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Servidor de desarrollo',
        },
      ],
      tags: [
        {
          name: 'Configuration',
          description: 'Endpoints de configuración del sistema',
        },
        {
          name: 'Databases',
          description: 'Gestión de bases de datos',
        },
        {
          name: 'Stored Procedures',
          description: 'Operaciones con stored procedures',
        },
        {
          name: 'Projects',
          description: 'Gestión de proyectos',
        },
      ],
      components: {
        schemas: {
          DatabaseConfig: {
            type: 'object',
            properties: {
              server: { type: 'string', example: '192.168.0.245', description: 'Dirección del servidor SQL' },
              user: { type: 'string', example: 'sa', description: 'Usuario de SQL Server' },
              password: { type: 'string', example: 'password123', description: 'Contraseña' },
              database: { type: 'string', example: 'master', description: 'Base de datos por defecto' },
              port: { type: 'number', example: 1433, description: 'Puerto de SQL Server' },
            },
            required: ['server', 'user', 'password'],
          },
          OpenAIConfig: {
            type: 'object',
            properties: {
              apiKey: { type: 'string', example: 'sk-...', description: 'API Key de OpenAI' },
              model: { type: 'string', example: 'gpt-4', description: 'Modelo a utilizar' },
            },
            required: ['apiKey'],
          },
          SPMetadata: {
            type: 'object',
            description: 'Metadata de un Stored Procedure',
            properties: {
              _id: { type: 'string', description: 'ID de MongoDB' },
              database: { type: 'string', example: 'TyT', description: 'Base de datos' },
              schema: { type: 'string', example: 'dbo', description: 'Schema del SP' },
              spName: { type: 'string', example: 'WEB_Seek_Cliente_Cedula', description: 'Nombre del SP' },
              description: { type: 'string', description: 'Descripción del SP' },
              projectReferences: {
                type: 'array',
                items: { type: 'string' },
                example: ['WebFormCapacitacion'],
                description: 'Proyectos que usan este SP',
              },
              tablesUsed: {
                type: 'array',
                items: { type: 'string' },
                description: 'Tablas utilizadas por el SP',
              },
              lastScanDate: { type: 'string', format: 'date-time', description: 'Última fecha de escaneo' },
            },
          },
          SPParameter: {
            type: 'object',
            properties: {
              name: { type: 'string', example: '@cedula' },
              type: { type: 'string', example: 'varchar' },
              length: { type: 'number', example: 50 },
              isOutput: { type: 'boolean', example: false },
            },
          },
          SPDefinition: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              schema: { type: 'string' },
              definition: { type: 'string', description: 'Código SQL del SP' },
              parameters: {
                type: 'array',
                items: { $ref: '#/components/schemas/SPParameter' },
              },
            },
          },
          SPDetail: {
            type: 'object',
            properties: {
              metadata: { $ref: '#/components/schemas/SPMetadata' },
              definition: { $ref: '#/components/schemas/SPDefinition' },
            },
          },
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string', description: 'Mensaje de error' },
            },
          },
          Success: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string' },
            },
          },
        },
      },
      security: [],
    },
  });
  return spec;
};

