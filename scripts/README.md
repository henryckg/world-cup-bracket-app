# Scripts de Base de Datos

## populate-match-dates.sql

Este script SQL puebla las fechas de los partidos del Mundial 2026 en la tabla `matches`.

### Características:

- **Fechas realistas**: Los partidos están programados del 11 de junio al 2 de julio de 2026
- **Horarios variados**: 3 horarios por día (13:00, 16:00, 19:00 EDT)
- **Jornada 3 simultánea**: Los últimos partidos de cada grupo se juegan al mismo tiempo (15:00 y 19:00)
- **Zona horaria**: EDT (UTC-4)

### Cómo usar:

El script ya se ejecutó automáticamente. Si necesitas volver a ejecutarlo o modificar fechas:

```bash
# Opción 1: Ejecutar desde la consola de Neon
# Copia y pega el contenido del archivo en la consola SQL

# Opción 2: Usar el MCP server de Neon
# El script ya se ejecutó usando mcp0_run_sql_transaction
```

### Estructura del calendario:

- **Jornada 1**: 11-18 de junio (8 días)
  - 2 partidos por día de diferentes grupos
  
- **Jornada 2**: 19-26 de junio (8 días)
  - 2 partidos por día de diferentes grupos
  
- **Jornada 3**: 27 junio - 2 julio (6 días)
  - 4 partidos por día (2 grupos completos)
  - Partidos simultáneos dentro de cada grupo

### Personalización:

Para ajustar las fechas según el calendario oficial del torneo, edita el archivo y ejecuta los UPDATE statements correspondientes.

**Nota**: Las fechas están en formato ISO 8601 con zona horaria EDT (UTC-4).
