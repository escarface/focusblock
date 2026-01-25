# PRD: Menu de navegacion hibrido con Expo Router

## Overview
Actualizar el menu de navegacion principal para usar Expo Router en el nivel superior (tabs) manteniendo los stacks internos actuales. El menu sera de iconos unicamente y mostrara las secciones existentes (Timer, Projects/Tasks, History, Settings). El objetivo es modernizar la navegacion con las practicas actuales de Expo sin romper flujos ni comportamiento de la app.

## Goals
- Adoptar Expo Router para el nivel superior de navegacion (tabs).
- Mantener todas las secciones actuales accesibles desde el menu principal.
- Implementar tabs de icono solamente con etiquetas de accesibilidad.
- Conservar estilos y comportamiento de tema/safe area actuales.

## Quality Gates
These commands must pass for every user story:
- `npm test` - Test suite

## User Stories

### US-001: Estructura base de tabs con Expo Router
As a user, I want a modern tab-based navigation shell so that I can access the main sections quickly.

**Acceptance Criteria:**
- [ ] Crear estructura de tabs en `app/(tabs)/_layout.js` usando Expo Router.
- [ ] Definir rutas para Timer, Projects/Tasks, History y Settings.
- [ ] Los tabs muestran solo iconos (sin labels visibles) y tienen labels accesibles.
- [ ] El orden de tabs coincide con el actual (Timer, Tasks, History, Settings).

### US-002: Integrar flujos de Timer y History
As a user, I want Timer and History flows to work inside their tabs so that existing navigation remains familiar.

**Acceptance Criteria:**
- [ ] Timer mantiene navegación a EditBlock y BlockDetail.
- [ ] History mantiene navegación a BlockDetail.
- [ ] El back button retorna al tab correcto y a la pantalla previa esperada.

### US-003: Integrar flujos de Projects/Tasks y Settings
As a user, I want Projects and Settings flows to work inside their tabs so that existing navigation remains familiar.

**Acceptance Criteria:**
- [ ] Projects mantiene navegación a ProjectDetail, EditBlock y BlockDetail.
- [ ] Settings mantiene navegación a EditProfile.
- [ ] El back button retorna al tab correcto y a la pantalla previa esperada.

### US-004: Migracion del entry y providers
As a user, I want the app to start normally with all providers so that state, theme, and notifications keep working.

**Acceptance Criteria:**
- [ ] El entry usa Expo Router y mantiene `AppProvider`, `ThemeProvider`, `WatchCommandHandler`, y `SafeAreaProvider`.
- [ ] El splash/loading actual sigue funcionando sin flashes en blanco.
- [ ] La app inicia en iOS/Android sin errores de navegacion.

### US-005: Paridad visual del tab bar
As a user, I want the new tab bar to feel consistent with the current design so that the app looks cohesive.

**Acceptance Criteria:**
- [ ] El tab bar usa colores/tema actuales de `src/contexts/ThemeContext`.
- [ ] Iconos y espaciados mantienen consistencia visual con el menu actual.
- [ ] Se respetan safe areas en dispositivos con home indicator.

## Functional Requirements
- FR-1: La navegacion top-level debe usar Expo Router con un grupo `(tabs)`.
- FR-2: El menu principal debe incluir solo las secciones actuales (Timer, Projects/Tasks, History, Settings).
- FR-3: Los tabs deben ser icon-only; las etiquetas solo deben existir para accesibilidad.
- FR-4: Cada tab debe conservar los flujos y jerarquia actuales de pantallas.
- FR-5: Los colores del tab bar deben seguir el tema vigente (light/dark).
- FR-6: La app debe mantener providers y servicios actuales sin cambios de logica.

## Non-Goals (Out of Scope)
- Agregar nuevas secciones o pantallas al menu.
- Redisenar pantallas existentes mas alla del menu de navegacion.
- Cambios en modelos de datos, storage o logica de negocio.
- Integraciones externas o sync en la nube.

## Technical Considerations
- Navegacion actual en `src/navigation/AppNavigator.js` con React Navigation.
- Expo Router requiere `app/` y ajuste del entry (`index.js`).
- Enfoque hibrido: tabs en Expo Router y stacks internos reutilizando `src/screens`.
- Mantener comportamiento de modal de EditBlock (formSheet en iOS) dentro de los stacks.

## Success Metrics
- Acceso correcto a las 4 secciones y pantallas de detalle sin errores.
- Sin regresiones de navegacion reportadas.
- `npm test` pasa.

## Open Questions
- ¿Mantener nombres internos "Tasks" o alinear a "Projects" para rutas y analytics?
- ¿Conservar el blur del tab bar en iOS o simplificar a un fondo solido?