# 🎯 PLAN DE ACCIÓN: De Firebase Puro a PostgreSQL + Railway

## 📊 Estado Actual vs Objetivo

| Aspecto | Ahora | Objetivo |
|---------|-------|----------|
| **BD Datos** | Firestore ❌ | PostgreSQL ✅ |
| **Servidor** | Firebase ❌ | Express.js ✅ |
| **Autenticación** | Firebase Auth ✅ | Firebase Auth ✅ |
| **Hosting** | ? | Railway ✅ |

---

## 🚀 Plan en 3 Fases (total ~1-2 horas)

### **FASE 1: Preparar para Railway (30 min)**

✅ Ya hecho:
- Backend Express + Prisma creado
- Esquema PostgreSQL diseñado
- API endpoints listos
- Hooks React para API creados

#### Qué falta:
- [ ] Subir código a GitHub

**Cómo hacerlo:**
```bash
# En la raíz del proyecto (donde está .git)
git add .
git commit -m "feat: Migrar a PostgreSQL + Express backend"
git push origin main
```

**Tiempo**: 5 minutos

---

### **FASE 2: Deploy en Railway (20 min)**

Sigue la guía: [SETUP_RAILWAY_STEP_BY_STEP.md](SETUP_RAILWAY_STEP_BY_STEP.md)

**Resumen:**
1. Crea cuenta en Railway (2 min)
2. Crea PostgreSQL (1 min)
3. Deploy Backend (5 min)
4. Deploy Frontend (5 min)
5. Configura CORS (2 min)

**URLs finales:**
- Frontend: `https://zyra-frontend.up.railway.app`
- Backend: `https://zyra-backend.up.railway.app`

**Tiempo**: 20 minutos

---

### **FASE 3: Migrar Componentes React (30-60 min)**

Sigue la guía: [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)

**Qué hacer:**
1. Abre cada página/componente
2. Reemplaza Firestore imports por `useApi`
3. Prueba que funciona en Railway
4. Commit y push

**Componentes a migrar (en orden):**
1. Dashboard
2. Projects
3. Reports
4. Materials
5. Users/Profile

**Tiempo**: 30-60 minutos

---

## 📝 Checklist Completo

### Fase 1: GitHub
- [ ] `git add .`
- [ ] `git commit -m "Migration to SQL"`
- [ ] `git push origin main`

### Fase 2: Railway
- [ ] Cuenta Railway creada
- [ ] PostgreSQL creada
- [ ] Backend deployado
- [ ] Frontend deployado
- [ ] Variables configuradas
- [ ] Aplicación online

### Fase 3: Migración
- [ ] Dashboard migrado
- [ ] Projects migrado
- [ ] Reports migrado
- [ ] Materials migrado
- [ ] Probado en producción
- [ ] Sin errores Firestore

---

## 🎓 Archivos de Referencia

| Archivo | Propósito |
|---------|-----------|
| [SETUP_RAILWAY_STEP_BY_STEP.md](SETUP_RAILWAY_STEP_BY_STEP.md) | Deploy paso a paso |
| [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) | Migrar componentes React |
| [FIREBASE_MIGRATION_NOTES.md](FIREBASE_MIGRATION_NOTES.md) | Qué mantener/eliminar |
| `backend/README.md` | Setup local (si lo necesitas) |
| `src/lib/api-client.ts` | Cliente API (referencia) |
| `src/hooks/use-api.ts` | Hooks React (referencia) |

---

## 🔍 Ejemplos Rápidos

### Cambio #1: Leer Proyectos
```tsx
// ❌ ANTES (Firestore)
const { data: projects } = useCollection(
  query(collection(db, 'projects'))
);

// ✅ DESPUÉS (SQL API)
const { data: projects } = useApi('/projects');
```

### Cambio #2: Crear Reporte
```tsx
// ❌ ANTES (Firestore)
await addDoc(collection(db, 'reports'), reportData);

// ✅ DESPUÉS (SQL API)
await reportsAPI.create(reportData, token);
```

### Cambio #3: Filtrar por Proyecto
```tsx
// ❌ ANTES (Firestore)
const { data: reports } = useCollection(
  query(collection(db, 'reports'), where('projectId', '==', id))
);

// ✅ DESPUÉS (SQL API)
const { data: reports } = useApi(`/reports?projectId=${id}`);
```

---

## 🎯 Prioridad de Migración

**Crítico (do first):**
1. Dashboard - Más usado
2. Projects - Core feature

**Importante (do after):**
3. Reports - Frecuente
4. Materials - Funcionalidad

**Menor (do later):**
5. Profile - Menos crítico

---

## 🚨 Errores Comunes

### ❌ Error: "useCollection is not defined"
**Solución:**
```tsx
// Cambiar esto:
import { useCollection } from '@/firebase';

// Por esto:
import { useApi } from '@/hooks/use-api';
```

### ❌ Error: "API connection refused"
**Solución:**
- Verifica que backend está corriendo en Railway
- Verifica `NEXT_PUBLIC_API_URL` en .env.local

### ❌ Error: "CORS error"
**Solución:**
- Actualiza `FRONTEND_URL` en backend
- Railway reinicia automáticamente

### ❌ Error: "FirebaseError: Missing or insufficient permissions"
**Solución:**
- Ya no hay reglas de Firestore
- Todo está en la API con autenticación

---

## 💡 Tips

1. **Mantén Firebase Auth**: No cambies autenticación por ahora
2. **Deploy es fácil**: Railway lo maneja casi todo
3. **Testing**: Prueba en Railway después de cada cambio
4. **Logs útiles**: Railway → Logs muestra todo
5. **Variables**: Si cambia algo, Railway redeploy automático

---

## ✅ Próximo Paso

**AHORA MISMO:**

```bash
# Ir a la raíz del proyecto ZYRA-main
cd C:\Users\itzel\Downloads\ZYRA-main\ZYRA-main

# Subir a GitHub
git add .
git commit -m "feat: Add PostgreSQL backend and Railway deployment"
git push origin main

# Luego: Sigue SETUP_RAILWAY_STEP_BY_STEP.md
```

---

## 🎉 Después de Todo

✅ ZYRA corriendo en PostgreSQL
✅ Backend en Express.js
✅ Deployado en Railway
✅ Sin PostgreSQL local
✅ Production-ready

**Tiempo total estimado: 1-2 horas**

---

¿Empezamos? 🚀
