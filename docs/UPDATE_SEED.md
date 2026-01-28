# Actualizar Archivos JSON desde MongoDB

Este documento explica cómo actualizar los archivos `seed.json` y `metadata.json` en la carpeta `data/`.

## 📋 Prerequisitos

1. MongoDB debe estar corriendo (con Docker Compose)
2. La base de datos debe tener metadata actualizada (ejecutar escaneo desde la UI)

## 🔄 Pasos para Actualizar

### Opción 1: Usando npm (Recomendado)

Primero, agrega el script al `package.json`:

```bash
npm run update-seed
```

### Opción 2: Ejecutar directamente con tsx

```bash
npx tsx scripts/update-seed.ts
```

### Opción 3: Dentro del contenedor Docker

Si estás usando Docker:

```bash
docker-compose exec app npx tsx scripts/update-seed.ts
```

## 📁 Archivos Generados

El script genera/actualiza:

- `data/seed.json` - Datos completos de todos los SPs
- `data/metadata.json` - Solo metadata (descripción, proyectos, tablas)

## ⚠️ Notas Importantes

1. **Primero escanea**: Asegúrate de haber escaneado las bases de datos desde la UI antes de exportar
2. **Filtro aplicado**: Con el nuevo filtro, solo se exportarán SPs de usuario (no del sistema)
3. **Backup**: Considera hacer backup de los archivos JSON actuales antes de regenerarlos

## 🔍 Verificación

Después de ejecutar el script, verifica:

```bash
# Ver cantidad de SPs exportados
cat data/seed.json | grep -o "spName" | wc -l

# Ver tamaño del archivo
ls -lh data/seed.json
```
