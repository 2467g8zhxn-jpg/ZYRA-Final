# 🔧 Sobre Firebase - Qué Mantener y Qué Eliminar

## ✅ Mantén (Autenticación)

Firebase Auth lo usaremos para:
- ✅ Login/Register de usuarios
- ✅ Verificar identidad
- ✅ Obtener token JWT
- ✅ Reset de contraseña

**No toques estos archivos:**
```
src/firebase/
  ├── auth/use-user.tsx
  ├── config.ts
  ├── provider.tsx
  └── client-provider.tsx
```

**Y estas dependencias del package.json:**
```json
"firebase": "^11.9.1"  // ✅ Mantén
```

---

## ❌ Elimina (Firestore)

Firestore era la base de datos NoSQL. Ahora usamos PostgreSQL + API.

**Archivos que ya no necesitas:**
```
src/firebase/firestore/
  ├── use-doc.tsx        // ❌ Eliminar (reemplazado por useApi)
  └── use-collection.tsx // ❌ Eliminar (reemplazado por useApi)

src/firebase/
  ├── non-blocking-updates.tsx  // ❌ Eliminar
  ├── non-blocking-login.tsx    // ? Revisar
```

**No elimines:**
```
src/firebase/errors.ts
src/firebase/error-emitter.ts
```

---

## 🔄 Plan para Eliminar Firestore

### Paso 1: Identificar componentes que usan Firestore

En cada archivo `.tsx` que tenga:
```tsx
import { useCollection, useDoc } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
```

**Reemplazar por:**
```tsx
import { useApi } from '@/hooks/use-api';
```

### Paso 2: Ejemplos de Migración

#### **Dashboard (utiliza Firestore)**
```tsx
// ❌ ANTES
import { useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function Dashboard() {
  const db = useFirestore();
  const projectsRef = useMemo(() =>
    query(collection(db, 'projects'), where('status', '==', 'EnProceso')),
    [db]
  );
  const { data: projects } = useCollection(projectsRef);
  // ...
}

// ✅ DESPUÉS
import { useApi } from '@/hooks/use-api';

export default function Dashboard() {
  const { data: projects } = useApi('/projects');
  // La API filtra automáticamente
  // ...
}
```

#### **Crear Reporte**
```tsx
// ❌ ANTES
import { addDoc, collection } from 'firebase/firestore';

async function createReport(data) {
  await addDoc(collection(db, 'reports'), {
    ...data,
    timestamp: new Date()
  });
}

// ✅ DESPUÉS
import { reportsAPI } from '@/lib/api-client';

async function createReport(data) {
  await reportsAPI.create(data, token);
}
```

---

## 🎯 Archivos Firebase que Mantienen Funcionalidad

```
src/firebase/
├── config.ts              // ✅ Inicializa Firebase App
├── provider.tsx           // ✅ Context de Firebase
├── client-provider.tsx    // ✅ Proveedor en cliente
├── auth/
│   └── use-user.tsx       // ✅ Hook de usuario autenticado
├── errors.ts              // ✅ Manejo de errores
└── error-emitter.ts       // ✅ Emisor de eventos
```

---

## 🗑️ Pasos para Limpiar (Gradual)

### **Fase 1: No hagas nada por ahora**
La app funciona con Firebase Auth + SQL API. Sin conflictos.

### **Fase 2: Migra componentes uno a uno**
1. Reemplaza `useCollection` por `useApi` en un componente
2. Prueba que funcione
3. Siguiente componente

### **Fase 3: Después de todo migrado (futuro)**
Puedes eliminar:
```bash
npm uninstall firebase
# Y eliminar src/firebase/firestore/
```

---

## 🔑 Resumen: Qué cambiar en cada página

### Dashboard
- ❌ `useCollection` → ✅ `useApi`
- ❌ Firestore queries → ✅ API calls

### Projects Page
- ❌ `useCollection` → ✅ `useApi`
- ❌ `addDoc` → ✅ `projectsAPI.create`

### Reports Page
- ❌ `useCollection` → ✅ `useApi`
- ❌ `setDoc` → ✅ `reportsAPI.update`

### Materials Page
- ❌ `useCollection` → ✅ `useApi`

---

## ✅ Checklist: Qué hacer

**Ahora (antes de Railway):**
- [ ] Sube código a GitHub
- [ ] Deploy a Railway
- [ ] Verifica que funciona

**Después (gradualmente):**
- [ ] Migra Dashboard a useApi
- [ ] Migra Projects a API
- [ ] Migra Reports a API
- [ ] Migra Materials a API
- [ ] Prueba todo
- [ ] (Opcional) Elimina Firestore completamente

---

## 💡 Firebase Auth vs JWT (futuro)

Por ahora:
- Usas **Firebase Auth** para login/register
- Usas **Token Firebase** para autorizar requests a backend

Futuro (opcional):
- Podrías cambiar a JWT puro en backend
- Pero Firebase Auth funciona perfectamente

---

**Tl;dr:**
- ✅ Mantén Firebase Auth (para login)
- ❌ Reemplaza Firestore por useApi() (para datos)
- 🎯 Migra componentes gradualmente sin prisa
