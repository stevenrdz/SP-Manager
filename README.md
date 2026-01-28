# 📚 SP Manager - SQL Server Stored Procedure Documentation Tool

> **Una aplicación moderna para gestionar, documentar y analizar Stored Procedures de SQL Server con inteligencia artificial y configuración dinámica.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green?logo=mongodb)](https://www.mongodb.com/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-Compatible-red?logo=microsoft-sql-server)](https://www.microsoft.com/sql-server)

---

## 🎯 Descripción

**SP Manager** es una herramienta web diseñada para equipos de desarrollo y DBAs que necesitan mantener documentación actualizada de sus Stored Procedures en SQL Server. El proyecto resuelve el problema común de la falta de documentación técnica centralizada, permitiendo:

- 🔍 **Explorar** múltiples bases de datos SQL Server desde una interfaz unificada
- 📝 **Documentar** cada SP con descripciones detalladas y metadatos
- 🏷️ **Organizar** SPs por proyectos relacionados mediante un sistema de etiquetas inteligente
- 🤖 **Automatizar** la generación de documentación usando OpenAI
- 💾 **Sincronizar** automáticamente metadatos en MongoDB para búsquedas rápidas
- ⚙️ **Configurar** credenciales dinámicamente sin reiniciar Docker
- 📖 **Documentar APIs** con Swagger UI integrado
- 📥 **Exportar** código SQL de procedimientos almacenados

---

## 🚀 Stack Tecnológico

### Frontend

- **[Next.js 16](https://nextjs.org/)** - Framework React con App Router
- **[React 19](https://react.dev/)** - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[TailwindCSS 4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI reutilizables
- **[Radix UI](https://www.radix-ui.com/)** - Primitivas UI accesibles
- **[Lucide Icons](https://lucide.dev/)** - Iconografía moderna
- **[Swagger UI React](https://swagger.io/tools/swagger-ui/)** - Documentación interactiva de APIs

### Backend

- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Endpoints REST
- **[Node.js](https://nodejs.org/)** - Runtime JavaScript
- **[mssql](https://www.npmjs.com/package/mssql)** - Cliente SQL Server para Node.js

### Bases de Datos

- **[SQL Server](https://www.microsoft.com/sql-server)** - Fuente de datos (Stored Procedures)
- **[MongoDB](https://www.mongodb.com/)** - Almacenamiento de metadatos y configuración
- **[Mongoose](https://mongoosejs.com/)** - ODM para MongoDB

### Inteligencia Artificial

- **[OpenAI API](https://platform.openai.com/)** - Generación automática de documentación

### DevOps

- **[Docker](https://www.docker.com/)** - Contenedorización
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestación de servicios

---

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura en capas** inspirada en Clean Architecture:

```
src/
├── app/                    # Next.js App Router (UI + API Routes)
│   ├── api/               # Endpoints REST
│   │   ├── backup/        # Exportación de backups
│   │   ├── config/        # Configuración dinámica
│   │   ├── databases/     # Listar bases de datos
│   │   ├── doc/           # Especificación OpenAPI
│   │   ├── projects/      # Gestión de proyectos
│   │   ├── scan/          # Escaneo de bases de datos
│   │   ├── sp-detail/     # Detalle y actualización de SPs
│   │   ├── sps/           # Listar SPs por base de datos
│   │   └── statistics/    # Estadísticas del sistema
│   ├── api-docs/          # Página de documentación Swagger
│   ├── config/            # Página de configuración
│   └── page.tsx           # Página principal
├── domain/                # Capa de dominio (entidades e interfaces)
│   ├── entities.ts        # Modelos de datos
│   ├── models/            # Modelos de configuración
│   └── repositories.ts    # Contratos de repositorios
├── application/           # Capa de aplicación (lógica de negocio)
│   ├── services/          # Servicios de aplicación
│   └── di.ts              # Inyección de dependencias
├── infrastructure/        # Capa de infraestructura (implementaciones)
│   ├── database/          # Esquemas de MongoDB
│   ├── repositories/      # Implementaciones de repositorios
│   ├── services/          # Servicios externos (OpenAI)
│   ├── dbConnect.ts       # Conexión a MongoDB
│   └── sqlConnection.ts   # Conexión dinámica a SQL Server
├── components/            # Componentes React reutilizables
│   ├── common/            # Componentes comunes
│   ├── projects/          # Vista de proyectos
│   ├── sp/                # Componentes de SPs
│   └── ui/                # Componentes UI (shadcn)
├── context/               # Contextos de React
└── layout/                # Componentes de layout
```

### Flujo de Datos

1. **Usuario** → Interactúa con la UI (React/Next.js)
2. **UI** → Llama a API Routes (`/api/*`)
3. **API Routes** → Invoca servicios de aplicación
4. **Servicios** → Utilizan repositorios para acceder a datos
5. **Repositorios** → Consultan SQL Server o MongoDB
6. **Respuesta** → Flujo inverso hasta la UI

---

## ✨ Funcionalidades Principales

### 1. 🗄️ Exploración de Bases de Datos

- Listado automático de todas las bases de datos SQL Server accesibles
- Búsqueda y filtrado de Stored Procedures por nombre o esquema
- Visualización de metadatos (fecha de creación, modificación, parámetros)
- Navegación consistente desde cualquier página

### 2. 📖 Documentación Completa

- **Editor de texto enriquecido** para descripciones detalladas
- **Visualización de código SQL** con syntax highlighting
- **Exportación de código SQL** a archivos `.sql`
- **Detección automática** de tablas utilizadas en el SP
- **Historial de escaneos** para rastrear cambios

### 3. 🏷️ Gestión de Proyectos Relacionados

- **Sistema de etiquetas (tags)** para asociar SPs a proyectos
- **Autocompletado inteligente** que sugiere proyectos existentes
- **Búsqueda en tiempo real** para evitar duplicados
- **Edición inline** con doble clic en los tags
- **Vista de proyectos** para buscar SPs por proyecto

### 4. 🤖 Generación Automática con IA

- Integración con **OpenAI GPT** para analizar código SQL
- Generación automática de descripciones técnicas
- Configuración dinámica de API key y modelo
- Manejo de errores de cuota con enlaces directos a billing

### 5. 🔄 Sincronización Automática

- **Escaneo bajo demanda** con barra de progreso en tiempo real
- **Actualización incremental** de SPs nuevos o modificados
- **Exportación a JSON** para backups y versionado
- **Estadísticas del sistema** (total de SPs, bases de datos, proyectos)

### 6. ⚙️ Configuración Dinámica (Nueva)

- **Gestión de credenciales** sin archivos `.env`
- **Almacenamiento en MongoDB** con encriptación
- **Cambio de configuración** sin reiniciar Docker
- **Prueba de conexión** antes de guardar
- **Fallback automático** a variables de entorno
- **Caché de configuración** (1 minuto TTL)
- **Soporte multi-base de datos** (SQL Server, PostgreSQL, MySQL, Oracle preparado)

### 7. 📖 Documentación API con Swagger (Nueva)

- **Swagger UI integrado** en `/api-docs`
- **19 endpoints documentados** en español
- **Especificación OpenAPI 3.0** generada automáticamente
- **Categorías organizadas**: Configuration, Databases, Stored Procedures, Projects, Backup, Statistics
- **Prueba interactiva** de endpoints desde el navegador

---

## 📦 Instalación

### Requisitos Previos

- **Node.js** 20+ y npm
- **MongoDB** 4.4+ (local o remoto)
- **SQL Server** con acceso de lectura a las bases de datos
- **OpenAI API Key** (opcional, solo para funcionalidad de IA)

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd sp-manager
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# SQL Server Connection (Fallback - Opcional si usas configuración dinámica)
SQL_HOST=your-server.database.windows.net
SQL_USER=your-username
SQL_PASSWORD=your-password
SQL_DATABASE=master
SQL_PORT=1433

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/sp-manager

# OpenAI (Opcional - Puede configurarse desde la UI)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### 5. Build para Producción

```bash
npm run build
npm start
```

---

## 🐳 Docker

### Ejecutar con Docker Compose

```bash
docker-compose up -d
```

Esto levantará:

- La aplicación Next.js en el puerto `3000`
- MongoDB en el puerto `27017`

---

## 📖 Uso

### 1. Configurar Credenciales (Primera vez)

1. Ve a **Configuración** en el sidebar
2. En la pestaña **Base de Datos**:
   - Ingresa las credenciales de SQL Server
   - Haz clic en **Probar Conexión**
   - Si es exitosa, haz clic en **Guardar**
3. En la pestaña **OpenAI** (opcional):
   - Ingresa tu API Key
   - Selecciona el modelo
   - Haz clic en **Validar y Guardar**

### 2. Sincronizar Base de Datos

1. Selecciona una base de datos del dropdown en el header
2. Haz clic en **Sincronizar**
3. Espera a que termine el escaneo (verás la barra de progreso)

### 3. Documentar un SP

1. Haz clic en un SP del sidebar o de la lista
2. Edita la **Descripción General** en el tab "Documentación"
3. Añade **Proyectos Relacionados**:
   - Escribe el nombre del proyecto
   - Selecciona de las sugerencias o presiona **Enter**
   - Doble clic para editar un tag existente
   - Elimina tags con el botón **X**
4. (Opcional) Usa **Analizar con IA** para generar documentación automática
5. Haz clic en **Guardar Cambios**

### 4. Exportar Código SQL

1. Abre un SP
2. Ve al tab **Código SQL**
3. Haz clic en **Exportar SQL**
4. El archivo `.sql` se descargará automáticamente

### 5. Buscar por Proyecto

1. Ve a **Proyectos** en el sidebar
2. Escribe el nombre del proyecto
3. Selecciona de las sugerencias
4. Verás todos los SPs asociados a ese proyecto

### 6. Ver Documentación API

1. Ve a **Documentación** en el sidebar
2. Explora los 19 endpoints disponibles
3. Prueba los endpoints directamente desde Swagger UI

---

## 🛠️ API Endpoints

### Configuration

| Método | Endpoint                    | Descripción                         |
| ------ | --------------------------- | ----------------------------------- |
| `GET`  | `/api/config`               | Obtener configuración actual        |
| `POST` | `/api/config/database/save` | Guardar configuración de SQL Server |
| `POST` | `/api/config/database/test` | Probar conexión a SQL Server        |
| `POST` | `/api/config/openai/save`   | Guardar configuración de OpenAI     |
| `POST` | `/api/config/openai/test`   | Probar configuración de OpenAI      |

### Databases

| Método | Endpoint         | Descripción                    |
| ------ | ---------------- | ------------------------------ |
| `GET`  | `/api/databases` | Lista todas las bases de datos |

### Stored Procedures

| Método | Endpoint                       | Descripción                    |
| ------ | ------------------------------ | ------------------------------ |
| `GET`  | `/api/sps`                     | Lista SPs de una base de datos |
| `GET`  | `/api/sp-detail/{compositeId}` | Obtiene detalles de un SP      |
| `PUT`  | `/api/sp-detail/{compositeId}` | Actualiza metadatos de un SP   |

### Projects

| Método | Endpoint                   | Descripción              |
| ------ | -------------------------- | ------------------------ |
| `GET`  | `/api/projects`            | Lista proyectos únicos   |
| `GET`  | `/api/projects/{name}/sps` | Lista SPs de un proyecto |

### Backup

| Método | Endpoint             | Descripción                   |
| ------ | -------------------- | ----------------------------- |
| `GET`  | `/api/backup/export` | Exporta backup JSON de una BD |

### Statistics

| Método | Endpoint          | Descripción                      |
| ------ | ----------------- | -------------------------------- |
| `GET`  | `/api/statistics` | Obtiene estadísticas del sistema |

### Scan

| Método | Endpoint    | Descripción               |
| ------ | ----------- | ------------------------- |
| `POST` | `/api/scan` | Escanea una base de datos |

### Documentation

| Método | Endpoint   | Descripción                    |
| ------ | ---------- | ------------------------------ |
| `GET`  | `/api/doc` | Obtiene especificación OpenAPI |

---

## 🔧 Características Técnicas

### Configuración Dinámica

- **Singleton Pattern**: Una única configuración por aplicación
- **Caché en memoria**: 1 minuto TTL para reducir consultas a MongoDB
- **Fallback automático**: Si no hay configuración en MongoDB, usa `.env`
- **Refresh sin reinicio**: Actualiza conexiones SQL sin reiniciar Docker
- **Validación previa**: Prueba conexiones antes de guardar

### Arquitectura de Datos

- **Composite IDs**: Identificadores únicos basados en `{db, schema, name}`
- **UTF-8 Encoding**: Soporte completo para caracteres Unicode
- **Detección de tablas**: Análisis automático de código SQL
- **Timestamps automáticos**: Fecha de último escaneo en cada SP

### Optimizaciones

- **Búsqueda global**: Búsqueda de SPs en todas las bases de datos
- **Debouncing**: Búsqueda con delay de 300ms para reducir consultas
- **Lazy loading**: Carga de datos bajo demanda
- **Caché de proyectos**: Lista de proyectos cacheada en frontend

---

## 📂 Estructura del Proyecto

```
sp-manager/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── api-docs/          # Documentación Swagger
│   │   ├── config/            # Página de configuración
│   │   ├── globals.css        # Estilos globales
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página de inicio
│   ├── application/           # Servicios de aplicación
│   │   ├── services/
│   │   └── di.ts
│   ├── components/            # Componentes React
│   │   ├── common/
│   │   ├── projects/
│   │   ├── sp/
│   │   └── ui/
│   ├── context/               # Contextos React
│   ├── domain/                # Entidades y contratos
│   ├── infrastructure/        # Implementaciones
│   │   ├── database/
│   │   ├── repositories/
│   │   └── services/
│   ├── layout/                # Componentes de layout
│   └── lib/                   # Utilidades
├── public/                    # Archivos estáticos
├── data/                      # Backups JSON
├── docker-compose.yml         # Configuración Docker
├── Dockerfile                 # Imagen Docker
├── package.json               # Dependencias
└── tsconfig.json              # Configuración TypeScript
```

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si deseas mejorar el proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Estándares de Código

- Usa **TypeScript** para todo el código
- Sigue las convenciones de **ESLint**
- Escribe código limpio y bien documentado
- Mantén la arquitectura en capas
- Documenta endpoints con JSDoc para Swagger

---

## 🐛 Reportar Bugs

Si encuentras un bug, por favor abre un **Issue** en GitHub con:

- Descripción del problema
- Pasos para reproducirlo
- Comportamiento esperado vs. actual
- Screenshots (si aplica)

---

## 📄 Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE) - consulta el archivo LICENSE para más detalles.

---

## 👨‍💻 Autor

Desarrollado con ❤️ por **Steven Rodríguez**

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) por el framework increíble
- [shadcn/ui](https://ui.shadcn.com/) por los componentes UI
- [OpenAI](https://openai.com/) por la API de IA
- [Swagger](https://swagger.io/) por las herramientas de documentación
- Comunidad open-source por las herramientas utilizadas
