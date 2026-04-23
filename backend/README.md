# ZYRA Backend - Guía de Setup

## 📦 Requisitos Previos

- Node.js 18+ 
- PostgreSQL instalado localmente o acceso a un servidor PostgreSQL
- npm o yarn

## 🚀 Instalación y Setup

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus valores:
```
DATABASE_URL="postgresql://user:password@localhost:5432/zyra"
FIREBASE_PROJECT_ID="tu-proyecto-firebase"
FIREBASE_PRIVATE_KEY="tu-private-key"
FIREBASE_CLIENT_EMAIL="tu-email-firebase"
PORT=3001
NODE_ENV=development
JWT_SECRET="tu-jwt-secret-super-seguro"
FRONTEND_URL="http://localhost:9002"
```

### 3. Generar Prisma Client
```bash
npm run prisma:generate
```

### 4. Ejecutar migraciones
```bash
npm run prisma:migrate
```

Esto creará todas las tablas en tu base de datos PostgreSQL.

### 5. Iniciar el servidor
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## 📊 Esquema de Base de Datos

### Tablas principales:
- **users** - Usuarios del sistema
- **teams** - Equipos/organizaciones
- **projects** - Proyectos
- **projectMembers** - Relación usuarios-proyectos
- **reports** - Reportes de proyectos
- **materials** - Materiales/inventario
- **projectMaterials** - Relación proyectos-materiales
- **activities** - Log de actividades
- **notifications** - Notificaciones

## 📍 API Endpoints

### Users
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `GET /api/users/firebase/:firebaseUid` - Obtener por Firebase UID
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Projects
- `GET /api/projects` - Listar proyectos
- `GET /api/projects/:id` - Obtener proyecto
- `POST /api/projects` - Crear proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto
- `POST /api/projects/:id/members` - Agregar miembro

### Reports
- `GET /api/reports` - Listar reportes
- `GET /api/reports/:id` - Obtener reporte
- `POST /api/reports` - Crear reporte
- `PUT /api/reports/:id` - Actualizar reporte
- `DELETE /api/reports/:id` - Eliminar reporte

### Materials
- `GET /api/materials` - Listar materiales
- `GET /api/materials/:id` - Obtener material
- `POST /api/materials` - Crear material
- `PUT /api/materials/:id` - Actualizar material
- `DELETE /api/materials/:id` - Eliminar material

## 🔧 Comandos útiles

```bash
# Ver y editar datos con GUI
npm run prisma:studio

# Generar nuevas migraciones
npm run prisma:migrate

# Compilar TypeScript
npm run build

# Iniciar en producción
npm run start
```

## 🌐 Deployment

### Railway.app (Recomendado)
1. Crea una cuenta en https://railway.app
2. Conecta tu repositorio GitHub
3. Railway detectará automáticamente el backend
4. Configura las variables de entorno en el dashboard
5. Deploy automático en cada push a main

### Render.com
Similar a Railway, conecta el repo y configura variables de entorno.

## 📝 Variables de Entorno Necesarias

- `DATABASE_URL` - Conexión PostgreSQL
- `FIREBASE_PROJECT_ID` - ID del proyecto Firebase
- `FIREBASE_PRIVATE_KEY` - Clave privada Firebase
- `FIREBASE_CLIENT_EMAIL` - Email del cliente Firebase
- `PORT` - Puerto (default 3001)
- `NODE_ENV` - Ambiente (development/production)
- `JWT_SECRET` - Secreto JWT
- `FRONTEND_URL` - URL del frontend

## 🐛 Troubleshooting

### "database connection error"
- Verifica que PostgreSQL esté corriendo
- Verifica la DATABASE_URL
- Verifica credenciales

### "prisma client not found"
```bash
npm run prisma:generate
```

### "port already in use"
Cambiar PORT en .env a otro puerto disponible

---

Para más info: https://prisma.io/docs
