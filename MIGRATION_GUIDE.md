# 🔄 Guía de Migración: Firebase → PostgreSQL + Express

## 📋 Resumen de cambios

Tu aplicación ZYRA está siendo migrada de:
- ❌ **Firebase Firestore** (NoSQL)
- ✅ **PostgreSQL** (SQL) + Express.js API

## 🎯 Cambios principales

### Backend
- ✅ **Express.js** - Servidor API
- ✅ **Prisma ORM** - Acceso a base de datos
- ✅ **PostgreSQL** - Base de datos relacional

### Frontend
- ✅ **useApi hook** - Reemplaza `useCollection` y `useDoc`
- ✅ **api-client.ts** - Cliente API tipado
- ✅ Mantiene Firebase Auth (opcional)

## 🚀 Pasos para completar la migración

### Paso 1: Clonar datos de Firestore a PostgreSQL

```bash
# En el backend, ejecutar script de migración
npm run seed
```

### Paso 2: Instalar variables de entorno en frontend

En el raíz del proyecto, actualiza `.env.local`:

```env
# Frontend - Añadir nueva variable
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Paso 3: Reemplazar hooks de Firestore

**Antes (Firestore):**
```tsx
import { useCollection, useDoc } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function ProjectsPage() {
  const db = useFirestore();
  const projectsRef = useMemo(() => 
    query(collection(db, 'projects')), 
    [db]
  );
  const { data: projects } = useCollection(projectsRef);
  
  return <div>{projects?.map(p => <p>{p.name}</p>)}</div>;
}
```

**Después (API):**
```tsx
import { useApi } from '@/hooks/use-api';

export default function ProjectsPage() {
  const { data: projects } = useApi('/projects');
  
  return <div>{projects?.map(p => <p>{p.name}</p>)}</div>;
}
```

### Paso 4: Actualizar funciones de lectura

#### Usuarios

```tsx
// Firestore
const userRef = useMemo(() => doc(db, 'users', userId), [userId, db]);
const { data: user } = useDoc(userRef);

// API
const { data: user } = useApi(`/users/${userId}`, token);
```

#### Proyectos

```tsx
// Firestore
const projectsRef = useMemo(() => 
  query(collection(db, 'projects'), where('teamId', '==', teamId)),
  [teamId, db]
);
const { data: projects } = useCollection(projectsRef);

// API
const { data: projects } = useApi('/projects', token);
```

#### Reportes

```tsx
// Firestore
const reportsRef = useMemo(() =>
  query(collection(db, 'reports'), where('projectId', '==', projectId)),
  [projectId, db]
);
const { data: reports } = useCollection(reportsRef);

// API
const { data: reports } = useApi(`/reports?projectId=${projectId}`, token);
```

### Paso 5: Actualizar funciones de escritura

**Antes (Firestore):**
```tsx
import { setDoc, doc } from 'firebase/firestore';

async function updateUser(userId, data) {
  await setDoc(doc(db, 'users', userId), data, { merge: true });
}
```

**Después (API):**
```tsx
import { usersAPI } from '@/lib/api-client';

async function updateUser(userId, data) {
  await usersAPI.update(userId, data, token);
}
```

### Ejemplos completos

#### Crear Proyecto

```tsx
import { projectsAPI } from '@/lib/api-client';
import { useAuth } from '@/lib/firebase/auth-context';

export default function CreateProjectPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData) {
    try {
      setLoading(true);
      const idToken = await user?.getIdToken();
      
      const newProject = await projectsAPI.create(
        {
          name: formData.name,
          description: formData.description,
          status: 'EnProceso',
        },
        idToken
      );
      
      toast.success('Proyecto creado');
      router.push(`/projects/${newProject.id}`);
    } catch (error) {
      toast.error('Error al crear proyecto');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleCreate(new FormData(e.currentTarget));
    }}>
      {/* formulario */}
    </form>
  );
}
```

#### Listar y Filtrar

```tsx
import { reportsAPI } from '@/lib/api-client';
import { useApi } from '@/hooks/use-api';

export default function ReportsPage({ projectId }) {
  const { data: reports, loading, error, refetch } = useApi(
    `/reports?projectId=${projectId}`
  );

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {reports?.map(report => (
        <ReportCard key={report.id} report={report} />
      ))}
      <button onClick={refetch}>Actualizar</button>
    </div>
  );
}
```

## 🔐 Autenticación

Firebase Auth se mantiene igual. Solo cambia cómo accedes a los datos:

```tsx
import { useAuth } from '@/lib/firebase/auth-context';

export default function Dashboard() {
  const { user } = useAuth(); // De Firebase Auth
  const { data: profile } = useApi(`/users/firebase/${user?.uid}`, 
    await user?.getIdToken()
  );

  return <div>{profile?.name}</div>;
}
```

## 📊 Mapeo de colecciones Firestore → Tablas SQL

| Firestore | PostgreSQL |
|-----------|------------|
| /users/{userId} | users |
| /projects/{projectId} | projects |
| /projects/{id}/members/{uid} | projectMembers |
| /reports/{reportId} | reports |
| /materials/{materialId} | materials |
| /teams/{teamId} | teams |

## 🧪 Testing la API

```bash
# Health check
curl http://localhost:3001/health

# Obtener usuarios
curl http://localhost:3001/api/users

# Obtener usuario específico
curl http://localhost:3001/api/users/{id}

# Crear proyecto (con autenticación)
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"name":"Nuevo Proyecto"}'
```

## ⚠️ Cosas importantes

1. **Token de Firebase**: Usa `user.getIdToken()` para obtener el token
2. **CORS**: El backend está configurado para aceptar requests del frontend
3. **Errores**: La API devuelve errores en formato JSON
4. **Refetch**: Usa `refetch()` para actualizar datos manualmente

## 🐛 Troubleshooting

### "API not responding"
- Verifica que el backend está corriendo: `npm run dev` en carpeta backend
- Verifica NEXT_PUBLIC_API_URL en .env.local

### "CORS error"
- Verifica FRONTEND_URL en .env del backend
- Debe coincidir con donde está corriendo el frontend

### "401 Unauthorized"
- Verifica que estás pasando el token correctamente
- El token debe ser válido de Firebase

## 📝 Archivos modificados

- ✅ `src/lib/api-client.ts` - Cliente API
- ✅ `src/hooks/use-api.ts` - Hooks de React
- ✅ `backend/` - Nuevo servidor Express

## 🎉 Próximos pasos

1. Instalar backend: `cd backend && npm install`
2. Configurar .env del backend con PostgreSQL
3. Ejecutar migraciones: `npm run prisma:migrate`
4. Iniciar backend: `npm run dev`
5. Actualizar componentes React uno a uno
6. Deploy en Railway.app

¡Necesitas ayuda? Pregunta sin dudas! 🚀
