# Workstreams técnicos

## 1) Design Tokens
- src/theme/typography.js: tamaños, pesos, lineHeight.
- src/theme/spacing.js: escala + semánticos.
- src/theme/colors.js: estados (pressed/disabled), overlays.

## 2) Componentes base
- src/components/Button.js: estados, loading, haptics.
- src/components/Card.js: elevación + pressed.
- src/components/Input.js: focus/error/success.
- src/components/Toggle.js: spring + haptic.
- src/components/BlockCard.js: estados activos y densidad.

## 3) Navegación (Expo Router)
- app/ structure + _layout.tsx.
- Migrar rutas principales.
- Actualizar navegación (router/Link).

## 4) Hero Screens
- TimerScreen: ring animado + micro-interacciones.
- EditBlockScreen: sheet premium + validación animada.

## 5) Lists & Perf
- FlatList en Timer/Projects/History.
- Skeleton loaders.
- Memoización de items.

## 6) iOS Patterns
- Context menus + previews.
- Headers nativos.
- Haptics en acciones clave.
