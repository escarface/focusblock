# Fase 2: Debug History

**Objetivo:** Entender por qué no aparecen tareas completadas y arreglarlo

**Problema que resuelve:**
- ❌ History no muestra tareas completadas

---

## Tareas

### [ ] Tarea 2.1: Agregar logs de debug

**Archivo:** `src/screens/HistoryScreen.js` (líneas 41-46)

**Objetivo:** Diagnosticar por qué no aparecen blocks en History

**Cambios:**

```javascript
const completedBlocks = useMemo(() => {
  const dateStr = formatDateString(selectedDate);
  const filtered = blocks.filter(
    b => b.scheduledDate === dateStr && b.status === 'completed'
  );

  // DEBUG: Log para diagnosticar
  console.log('HistoryScreen Debug:', {
    selectedDate: dateStr,
    totalBlocks: blocks.length,
    blocksWithDate: blocks.filter(b => b.scheduledDate === dateStr).length,
    completedBlocks: filtered.length,
    allStatuses: blocks.map(b => ({ id: b.id, status: b.status, date: b.scheduledDate }))
  });

  return filtered;
}, [blocks, selectedDate]);
```

**Verificación:**
- [ ] Los logs aparecen en consola
- [ ] Puedes ver cuántos blocks hay en total
- [ ] Puedes ver cuántos tienen la fecha de hoy
- [ ] Puedes ver los status de cada block

---

### [ ] Tarea 2.2: Verificar persistencia en storage

**Archivo:** `src/storage/index.js` (líneas 117-126)

**Objetivo:** Confirmar que updateBlock persiste correctamente el status

**Cambios:**

```javascript
async updateBlock(blockId, updates) {
  try {
    const blocks = await this.getBlocks();
    const index = blocks.findIndex(b => b.id === blockId);

    if (index !== -1) {
      blocks[index] = { ...blocks[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));

      // DEBUG: Confirmar persistencia
      console.log('Block updated in storage:', blocks[index]);
    }

    return blocks;
  } catch (error) {
    console.error('Error updating block:', error);
    throw error;
  }
}
```

**Verificación:**
- [ ] Al completar un block, aparece log "Block updated in storage"
- [ ] El status en el log es 'completed'
- [ ] No hay errores de persistencia

---

### [ ] Tarea 2.3: Mostrar vista de debug temporal

**Archivo:** `src/screens/HistoryScreen.js` (líneas 212-242, antes del empty state)

**Objetivo:** Ver información de debug directamente en la app

**Cambios:**

```javascript
{__DEV__ && (
  <View style={{ padding: 16, backgroundColor: '#FFF3CD', marginBottom: 16 }}>
    <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>DEBUG INFO:</Text>
    <Text>Selected Date: {formatDateString(selectedDate)}</Text>
    <Text>Total Blocks: {blocks.length}</Text>
    <Text>Completed Today: {completedBlocks.length}</Text>
    <Text style={{ marginTop: 8, fontWeight: 'bold' }}>All Blocks Status:</Text>
    {blocks.slice(0, 5).map(b => (
      <Text key={b.id} style={{ fontSize: 11 }}>
        {b.title}: {b.status} ({b.scheduledDate})
      </Text>
    ))}
  </View>
)}
```

**Verificación:**
- [ ] Aparece el panel amarillo de debug solo en modo desarrollo
- [ ] Muestra la fecha seleccionada
- [ ] Muestra cuántos blocks hay
- [ ] Muestra los primeros 5 blocks con su status y fecha

---

## Tests de Fase 2

### Test 1: Diagnosticar el problema ✓

1. Completar 2 blocks usando el timer (dejar que llegue a 0)
2. Ir a History tab
3. **Verificar en consola:**
   - [ ] `totalBlocks` es mayor a 0
   - [ ] `blocksWithDate` muestra cuántos tienen la fecha de hoy
   - [ ] `completedBlocks` muestra cuántos están completed
   - [ ] En `allStatuses` puedes ver el status de cada block
4. **Verificar en la app (panel debug):**
   - [ ] "Total Blocks" muestra el número correcto
   - [ ] "Completed Today" muestra el número correcto
   - [ ] La lista muestra los blocks con status y fecha

### Test 2: Identificar la causa raíz ✓

Basándose en los logs, determinar cuál es el problema:

- **Si `totalBlocks` es 0:** No hay blocks creados
- **Si `blocksWithDate` es 0:** Problema de formato de fecha
- **Si `completedBlocks` es 0 pero `blocksWithDate` > 0:** Los blocks no se están marcando como 'completed'

**Anota aquí el problema encontrado:**
```
[ ] Problema: _______________________________
[ ] Solución aplicada: _______________________
```

---

## Soluciones Comunes

### Si el problema es formato de fecha:

Los blocks se crean con `scheduledDate` pero el filtro usa otro formato.

**Solución:** Verificar que al crear blocks se usa `formatDateString(new Date())`

### Si el problema es que no se marca 'completed':

El timer no está llamando `updateBlock` correctamente.

**Solución:** Verificar Fase 1, Tarea 1.1

### Si el problema es que blocks no se persisten:

AsyncStorage falla o se sobrescribe.

**Solución:** Verificar logs de `updateBlock` en storage.js

---

## Nota Final

**IMPORTANTE:** Una vez identificado y arreglado el problema, REMOVER los logs de debug:
- [ ] Remover logs en `HistoryScreen.js` (Tarea 2.1)
- [ ] Remover logs en `storage.js` (Tarea 2.2)
- [ ] Remover panel debug en `HistoryScreen.js` (Tarea 2.3)
