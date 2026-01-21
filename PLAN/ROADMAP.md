# Roadmap - UI Modernization (iOS-first, premium)

## Contexto
- Migración a Expo Router.
- Tipografía system (SF), estética premium.
- P0: TimerScreen, EditBlockScreen, ProjectsScreen, HistoryScreen.

## Fases
### Fase 1 — Sistema visual unificado
- Tokens de spacing/typography/estados.
- Componentes base: Button, Card, Input, Toggle, BlockCard.
- Resultado: UI consistente, reusable.

### Fase 2 — Hero Timer
- CircularProgress animado (gradiente + pulse).
- Haptics en controles.
- Up Next con FlatList y stagger.

### Fase 3 — EditBlock premium
- FormSheet con estética glass.
- Validación con feedback visual + haptics.
- Selector de duración animado.

### Fase 4 — Projects + History
- Projects: FlatList + cards premium + modal refinado.
- History: stats con count-up + calendario con transición + skeletons.

### Fase 5 — Patrones iOS
- Context menus + previews.
- Headers nativos (large titles).

### Fase 6 — QA y performance
- 60fps en listas 100+.
- Dark mode consistente.
- Accesibilidad base (contraste, tamaños, estados).

## Dependencias clave
- Expo Router (antes de refactors de navegación).
- Tokens base (antes de restyling de screens).
