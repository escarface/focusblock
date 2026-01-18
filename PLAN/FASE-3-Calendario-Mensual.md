# Fase 3: Calendario Mensual/Semanal

**Objetivo:** Reemplazar streak por calendario con toggle mensual/semanal

**Problema que resuelve:**
- 📅 Quitar "🔥 1 day streak!" y poner calendario con vista mensual

---

## Tareas

### [ ] Tarea 3.1: Agregar estado y imports

**Archivo:** `src/screens/HistoryScreen.js`

**Objetivo:** Preparar el componente para el toggle de vistas

**Cambios:**

1. **Agregar estado** (después de línea 36):
```javascript
const [viewMode, setViewMode] = useState('week'); // 'week' o 'month'
```

2. **Agregar imports** (arriba del archivo):
```javascript
import { getCalendarMonth, formatDateString } from '../utils/statistics';
```

**Verificación:**
- [ ] Estado `viewMode` agregado
- [ ] Imports correctos

---

### [ ] Tarea 3.2: Crear selector de vista (Toggle Week/Month)

**Archivo:** `src/screens/HistoryScreen.js` (después del header, línea ~60)

**Objetivo:** Botones para cambiar entre vista semanal y mensual

**Agregar:**

```javascript
{/* View Mode Toggle */}
<View style={styles.viewModeContainer}>
  <TouchableOpacity
    style={[
      styles.viewModeButton,
      viewMode === 'week' && [styles.viewModeButtonActive, { backgroundColor: colors.primary }]
    ]}
    onPress={() => setViewMode('week')}
  >
    <Text style={[
      styles.viewModeText,
      { color: viewMode === 'week' ? '#FFF' : colors.textSecondary }
    ]}>
      Week
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.viewModeButton,
      viewMode === 'month' && [styles.viewModeButtonActive, { backgroundColor: colors.primary }]
    ]}
    onPress={() => setViewMode('month')}
  >
    <Text style={[
      styles.viewModeText,
      { color: viewMode === 'month' ? '#FFF' : colors.textSecondary }
    ]}>
      Month
    </Text>
  </TouchableOpacity>
</View>
```

**Verificación:**
- [ ] Aparecen 2 botones: "Week" y "Month"
- [ ] El botón activo tiene color primary
- [ ] Al tocar cambia el estado

---

### [ ] Tarea 3.3: Calcular datos del mes

**Archivo:** `src/screens/HistoryScreen.js` (después de `weekDays`, línea ~40)

**Objetivo:** Usar la función existente `getCalendarMonth` para obtener los días del mes

**Agregar:**

```javascript
const monthData = useMemo(() => {
  return getCalendarMonth(selectedDate.getFullYear(), selectedDate.getMonth());
}, [selectedDate]);
```

**Verificación:**
- [ ] `monthData` contiene weeks array
- [ ] Console log `monthData` para verificar estructura

---

### [ ] Tarea 3.4: Implementar vista mensual

**Archivo:** `src/screens/HistoryScreen.js` (líneas 100-132, reemplazar calendario actual)

**Objetivo:** Mostrar calendario mensual cuando `viewMode === 'month'`

**Reemplazar todo el bloque del calendario con:**

```javascript
{viewMode === 'week' ? (
  // Vista semanal EXISTENTE (mantener código actual)
  <View style={styles.weekCalendar}>
    {weekDays.map((day, index) => (
      <TouchableOpacity
        key={day.dateStr}
        style={[
          styles.dayColumn,
          day.isToday && [styles.todayColumn, { backgroundColor: colors.primary }],
          formatDateString(selectedDate) === day.dateStr &&
            !day.isToday && [styles.selectedColumn, { backgroundColor: colors.backgroundSecondary }],
        ]}
        onPress={() => setSelectedDate(day.date)}
      >
        <Text style={[styles.dayLabel, { color: colors.textMuted }]}>
          {WEEKDAYS[index]}
        </Text>
        <Text style={[
          styles.dayNumber,
          { color: day.isToday ? '#FFF' : colors.textPrimary },
        ]}>
          {day.dayOfMonth}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
) : (
  // Vista mensual NUEVA
  <View style={styles.monthCalendar}>
    {/* Header con días de la semana */}
    <View style={styles.monthHeader}>
      {WEEKDAYS.map((day, i) => (
        <Text key={i} style={[styles.monthHeaderDay, { color: colors.textMuted }]}>
          {day}
        </Text>
      ))}
    </View>

    {/* Grid de días */}
    {monthData.weeks.map((week, weekIndex) => (
      <View key={weekIndex} style={styles.monthWeek}>
        {week.map((day, dayIndex) => {
          if (!day) {
            return <View key={dayIndex} style={styles.monthDayEmpty} />;
          }

          const isSelected = formatDateString(selectedDate) === day.dateStr;
          const isToday = day.isToday;

          return (
            <TouchableOpacity
              key={day.dateStr}
              style={[
                styles.monthDay,
                isToday && [styles.monthDayToday, { backgroundColor: colors.primary }],
                isSelected && !isToday && [styles.monthDaySelected, { backgroundColor: colors.backgroundSecondary }],
              ]}
              onPress={() => setSelectedDate(day.date)}
            >
              <Text style={[
                styles.monthDayText,
                { color: isToday ? '#FFF' : colors.textPrimary },
              ]}>
                {day.dayOfMonth}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ))}
  </View>
)}
```

**Verificación:**
- [ ] Vista semanal se mantiene igual
- [ ] Vista mensual muestra grid de días
- [ ] Día actual está destacado
- [ ] Se puede seleccionar un día

---

### [ ] Tarea 3.5: Actualizar navegación (flechas)

**Archivo:** `src/screens/HistoryScreen.js` (líneas 72-83)

**Objetivo:** Las flechas navegan 7 días en week mode, 1 mes en month mode

**Reemplazar funciones:**

```javascript
const goToPrevious = () => {
  const newDate = new Date(selectedDate);
  if (viewMode === 'week') {
    newDate.setDate(newDate.getDate() - 7);
  } else {
    newDate.setMonth(newDate.getMonth() - 1);
  }
  setSelectedDate(newDate);
};

const goToNext = () => {
  const newDate = new Date(selectedDate);
  if (viewMode === 'week') {
    newDate.setDate(newDate.getDate() + 7);
  } else {
    newDate.setMonth(newDate.getMonth() + 1);
  }
  setSelectedDate(newDate);
};
```

**Verificación:**
- [ ] En modo week, flechas navegan 7 días
- [ ] En modo month, flechas navegan 1 mes
- [ ] La fecha seleccionada se mantiene

---

### [ ] Tarea 3.6: Agregar estilos para calendario mensual

**Archivo:** `src/screens/HistoryScreen.js` (en `StyleSheet.create`, al final)

**Objetivo:** Estilos para el nuevo calendario mensual

**Agregar:**

```javascript
viewModeContainer: {
  flexDirection: 'row',
  gap: 8,
  marginBottom: 16,
},
viewModeButton: {
  flex: 1,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
  alignItems: 'center',
  backgroundColor: '#F5F5F5',
},
viewModeButtonActive: {
  // backgroundColor aplicado dinámicamente
},
viewModeText: {
  fontSize: 14,
  fontWeight: '600',
},
monthCalendar: {
  marginBottom: 24,
},
monthHeader: {
  flexDirection: 'row',
  marginBottom: 8,
},
monthHeaderDay: {
  flex: 1,
  textAlign: 'center',
  fontSize: 12,
  fontWeight: '600',
},
monthWeek: {
  flexDirection: 'row',
  marginBottom: 4,
},
monthDay: {
  flex: 1,
  aspectRatio: 1,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
  margin: 2,
},
monthDayEmpty: {
  flex: 1,
  aspectRatio: 1,
},
monthDayToday: {
  // backgroundColor aplicado dinámicamente
},
monthDaySelected: {
  // backgroundColor aplicado dinámicamente
},
monthDayText: {
  fontSize: 14,
  fontWeight: '500',
},
```

**Verificación:**
- [ ] Toggle tiene estilos correctos
- [ ] Calendario mensual se ve bien
- [ ] Días son cuadrados (aspectRatio: 1)

---

### [ ] Tarea 3.7: Remover o mover streak

**Archivo:** `src/screens/HistoryScreen.js` (líneas 190-198)

**Objetivo:** Quitar el "🔥 1 day streak!"

**Opción recomendada - Remover completamente:**

```javascript
// ELIMINAR este bloque completo:
{streak > 0 && (
  <View style={[styles.streakCard, { backgroundColor: colors.primary + '15' }]}>
    <Text style={styles.streakEmoji}>🔥</Text>
    <Text style={[styles.streakText, { color: colors.primary }]}>
      {streak} day streak!
    </Text>
  </View>
)}
```

**Opción alternativa - Mover debajo del calendario:**

Si quieres mantenerlo, muévelo después del calendario y antes de "Completed Blocks"

**Verificación:**
- [ ] El streak ya no aparece (u aparece debajo del calendario)
- [ ] No hay errores

---

## Tests de Fase 3

### Test 1: Toggle funciona ✓

1. Ir a History tab
2. Ver que por default muestra vista semanal (7 días)
3. Tocar botón "Month"
4. **Verificar:**
   - [ ] Cambia a vista mensual (grid completo)
   - [ ] Botón "Month" se marca como activo (color primary)
5. Tocar botón "Week"
6. **Verificar:**
   - [ ] Vuelve a vista semanal
   - [ ] Botón "Week" se marca como activo

### Test 2: Calendario mensual ✓

1. En vista mensual, verificar:
   - [ ] Se muestran todos los días del mes
   - [ ] Header con M, T, W, T, F, S, S
   - [ ] Día actual está destacado con color primary
   - [ ] Espacios vacíos antes del día 1 (días del mes anterior)
   - [ ] Espacios vacíos después del último día (días del mes siguiente)

### Test 3: Selección de día ✓

1. En vista mensual, tocar un día diferente
2. **Verificar:**
   - [ ] El día se selecciona (color backgroundSecondary)
   - [ ] Los "Completed Blocks" muestran tareas de ese día
3. Cambiar a vista semanal
4. **Verificar:**
   - [ ] La selección se mantiene
   - [ ] La semana actual incluye el día seleccionado

### Test 4: Navegación ✓

1. En vista mensual, usar flecha izquierda
2. **Verificar:**
   - [ ] Navega al mes anterior
   - [ ] Header muestra el mes correcto
3. Usar flecha derecha 2 veces
4. **Verificar:**
   - [ ] Navega 2 meses adelante
5. Cambiar a vista semanal
6. Usar flechas
7. **Verificar:**
   - [ ] Navega 7 días a la vez

---

## Mejoras Futuras (Opcional)

- [ ] Persistir `viewMode` en AsyncStorage
- [ ] Mostrar días del mes anterior/siguiente con opacity 0.3
- [ ] Agregar indicador de "tiene blocks completados" en cada día
- [ ] Animación al cambiar entre vistas
