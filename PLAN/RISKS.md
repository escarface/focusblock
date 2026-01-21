# Riesgos y mitigaciones

## Riesgos
1) Regressions por migración a Expo Router.
2) Performance degradada por animaciones y listas no virtualizadas.
3) Inconsistencias en dark mode.
4) Fragmentación visual por estilos ad-hoc.

## Mitigaciones
- Migración incremental por pantallas.
- FlatList + memoización tempranas.
- QA visual por pantalla en light/dark.
- Centralizar tokens y componentes base.
