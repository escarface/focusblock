Genera la aplicacion completa de gestion de bloques de focus en React Native usando Expo. La aplicacion debe incluir las siguientes pantallas y funcionalidades:

# Desarrollo de Aplicacion FocusBlocks
- Asegurate de utilizar las ultimas versiones estables de React Native y Expo.
- Utiliza siempre la ultimas tecnologias y mejores practicas recomendadas en 2025.
- Asegurate de la compatibilidad de los paquetes con la version de Expo utilizada.
- Utiliza el mcp de context7 cuando sea necesario.


Pantallas:
- Splash Screen: Pantalla inicial atractiva con logo/nombre "FocusBlocks" y subtitulo (similar a la referencia).
- Pantalla de login (local):
  - Input de email y CTA “Send Magic Link” (solo local).
  - Botones “Continue with Google” y “Continue with GitHub” (simulados/local).
  - Debe crear/iniciar una sesion local (sin backend) y persistirla.
- Pantalla principal (Timer / Focus Mode):
  - Temporizador circular con progreso real y animacion fluida.
  - Muestra el bloque activo (titulo + categoria/tag).
  - Controles funcionales: play/pause, reset, skip/next.
  - Si termina el tiempo: marcar bloque como completado, registrar sesion en historial, y pasar al siguiente (si existe).
  - Seccion “Up Next” con cola de bloques del dia.
  - Boton flotante “+” para crear bloque rapidamente.
- Pantalla de gestion de proyectos:
  - CRUD completo: crear/editar/eliminar proyectos.
  - Dentro de un proyecto: lista de bloques (programados y completados), y acceso a crear/editar.
- Pantalla de gestion de bloques (por proyecto):
  - CRUD completo: crear/editar/eliminar bloques.
  - Marcar como completado / reabrir.
  - Reordenar bloques “Up Next” (drag & drop o controles de subir/bajar).
  - Campos del bloque: titulo, duracion (min), fecha/hora (opcional), categoria, color/tag, notas (opcional), estado.
- Pantalla de edicion/creacion de bloque (modal o screen tipo “Edit Block”):
  - Campo “What are you working on?” (titulo).
  - Duracion totalmente customizable:
    - Presets (15/25/30) + input/slider/stepper para minutos custom.
    - Botones +5m, +10m.
  - Selector de color/tag.
  - Seleccion de categoria (Work/Admin/Personal/etc) y notas.
  - “Save Block” y “Cancel”.
- Pantalla de detalles del bloque:
  - Informacion completa del bloque + acciones (editar, completar, eliminar).
  - Mostrar historial de sesiones si el bloque se repite o se ha pausado/reanudado varias veces.
- Pantalla de historial/estadisticas:
  - Vista por calendario/mes con selector de dia.
  - Metricas: Total Focus (tiempo), Sessions (conteo), racha (streak) opcional.
  - Objetivo diario configurable con barra de progreso y porcentaje.
  - Lista “Completed Blocks” del dia con duraciones.
  - Filtros por proyecto/categoria.
- Pantalla de configuracion:
  - Toggles funcionales:
    - Sound Alerts (sonido al iniciar/terminar/pausar si aplica).
    - Notifications (notificaciones locales).
    - Dark Mode (tema persistente).
  - Account:
    - Edit Profile (nombre/avatar local).
    - Manage Subscription (solo placeholder UI).
    - Log Out (cierra sesion local y vuelve a Login)

Diseño:
- Para el diseño quiero que analices la carpeta Images del proyecto donde tienes referencias visuales de cada pantalla y componente.
- Utiliza la skill de expo-app-desing para replicar los estilos, colores, tipografias y layout de las referencias.

Funcionalidades:
- Implementar logica completa (sin backend) con persistencia local:
  - Persistencia con AsyncStorage o SQLite (elige una y estructura el proyecto para escalar).
  - Guardar: usuarios/sesion local, proyectos, bloques, historial de sesiones, ajustes (tema/objetivo/notificaciones).
- Temporizador real:
  - Preciso en background/foreground (manejar AppState).
  - Mantener el conteo aunque el usuario minimice la app (segun limitaciones de Expo; usar timestamps para recalcular).
  - Registrar eventos: start/pause/resume/finish/skip y su timestamp.
- Notificaciones locales:
  - Programar notificacion al finalizar un bloque activo.
  - Si se pausa o se cambia de bloque, reprogramar/cancelar correctamente.
- Planificacion diaria:
  - “Up Next” debe reflejar los bloques programados para hoy (o la fecha seleccionada).
  - Al completar uno, pasa al siguiente automaticamente si el usuario lo tiene activado (setting opcional).
- Estadisticas:
  - Calcular total foco por dia/semana/mes, sesiones, porcentaje del objetivo diario, y progreso.
- Navegacion:
  - Auth flow (Splash -> Login -> App).
  - App con tabs (Timer, Projects/Blocks, History, Settings) + stacks/modals para crear/editar/detalles.
- Validaciones y UX:
  - No permitir guardar bloques sin titulo.
  - Duracion minima (ej. 1 minuto) y maxima razonable.
  - Confirmaciones para eliminar.
  - Estados vacios bonitos (“No blocks yet”, etc.).

Criterios de aceptacion:
- La aplicacion debe compilar y ejecutarse sin errores en Expo.
- Todas las pantallas y funcionalidades mencionadas deben estar presentes y ser navegables.
- Persistencia local funcionando (cierro y abro app y se mantiene todo).
- Temporizador funcional y consistente (incluye pausas, reanudaciones y finalizacion).
- Notificaciones locales funcionando (si el usuario las activa).
- Splash screen se muestra correctamente al iniciar la aplicacion.
- Codigo bien estructurado y comentado (ej. /screens, /components, /navigation, /theme, /storage, /services, /models, /utils).
- Tests basicos (minimo: utils de calculo de estadisticas y reducers/estado si aplican).
- Documentacion completa del proyecto, incluyendo:
  - Instalacion y ejecucion (Expo).
  - Estructura de carpetas.
  - Decisiones tecnicas (persistencia, timer en background, notificaciones).
  - Como usar la app (crear proyectos, crear bloques, iniciar focus, ver historial, cambiar ajustes).

Output <promise> COMPLETADO </promise> when all done and correct.
