# Plan de Mejoras FocusBlocks

Plan estructurado en fases con tareas marcables.

## Estructura

```
PLAN/
├── README.md (este archivo)
├── FASE-1-Timer-Completion.md
├── FASE-2-History-Debug.md
└── FASE-3-Calendario-Mensual.md
```

## Estado General

- [ ] Fase 1: Arreglar Timer Completion (3 tareas)
- [ ] Fase 2: Debug History (3 tareas)
- [ ] Fase 3: Calendario Mensual (7 tareas)

**Total:** 13 tareas

## Problemas a Resolver

1. ❌ Timer no se para al llegar a 0
2. ❌ History no muestra tareas completadas
3. ✅ Marcar como completada al llegar a 0 (mejorar implementación)
4. 📅 Reemplazar streak por calendario mensual/semanal

## Cómo Usar Este Plan

1. Lee cada archivo de fase en orden
2. Completa las tareas marcando `[x]` cuando termines
3. Verifica con los tests al final de cada fase
4. Actualiza este README con el progreso general

## Archivos Críticos

### Alta Prioridad
- `src/screens/TimerScreen.js` - Timer completion flow
- `src/services/TimerService.js` - Timer service
- `src/contexts/AppContext.js` - Estado global
- `src/screens/HistoryScreen.js` - Pantalla de historial

### Media Prioridad
- `src/storage/index.js` - Persistencia
- `src/utils/statistics.js` - Utilidades de calendario
- `src/components/Toggle.js` - Componente toggle
