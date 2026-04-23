# 🚀 Deployment en Railway.app

Railway es la forma más simple de deployar ZYRA. Aquí está la guía:

## Paso 1: Setup en Railway

1. Abre https://railway.app
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto

## Paso 2: Conectar Base de Datos PostgreSQL

1. En Dashboard de Railway, click en "New"
2. Selecciona "Database" → "PostgreSQL"
3. Espera a que se cree
4. Copia la `DATABASE_URL` que genera

## Paso 3: Conectar Backend (Express)

1. Click en "New" → "GitHub Repo"
2. Selecciona el repositorio ZYRA
3. En "Root Directory" especifica: `backend/`
4. Railway detectará que es Node.js

### Configurar Variables de Entorno del Backend

En el servicio del backend, ve a "Variables" y añade:

```env
DATABASE_URL=<copiada del paso 2>
FIREBASE_PROJECT_ID=studio-162226445-90191
FIREBASE_PRIVATE_KEY=<tu-private-key>
FIREBASE_CLIENT_EMAIL=<tu-email>
PORT=3001
NODE_ENV=production
JWT_SECRET=<genera-uno-fuerte>
FRONTEND_URL=<URL-del-frontend>
```

Railway generará automáticamente una URL pública para el backend.

## Paso 4: Conectar Frontend (Next.js)

1. Click en "New" → "GitHub Repo"
2. Selecciona el repositorio ZYRA (de nuevo)
3. Railway detectará que es Next.js

### Configurar Variables de Entorno del Frontend

En el servicio del frontend, ve a "Variables" y añade:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=<tu-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<tu-domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-162226445-90191
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<tu-bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<tu-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<tu-app-id>

# Backend API - Importante: usar URL de Railway (no localhost)
NEXT_PUBLIC_API_URL=<URL-generada-por-railway-del-backend>
```

## Paso 5: Deploy Automático

1. Cada vez que hagas push a GitHub, Railway automáticamente:
   - Descarga el código
   - Instala dependencias
   - Compila
   - Deploy

2. Puedes ver logs en tiempo real en el dashboard

## 🌐 URLs Finales

Después de deploy, tendrás:

- **Frontend**: https://zyra-frontend.up.railway.app
- **Backend API**: https://zyra-backend.up.railway.app
- **Base de Datos**: PostgreSQL en Railway

## 💰 Costos

- PostgreSQL: ~$7/mes (gratuito con crédito)
- Backend: ~$5-10/mes
- Frontend: ~$5-10/mes
- **Total**: ~$15-20/mes

Railway da $5 de crédito mensual, así que el costo real es muy bajo.

## 🔄 Actualizar Código

```bash
# Hacer cambios en tu código local
git add .
git commit -m "updates"
git push

# Railway automáticamente detectará los cambios y hará re-deploy
```

## 🆘 Troubleshooting

### "Build failed"
- Verifica los logs en Railway
- Asegúrate que package.json existe en la carpeta correcta
- Verifica que "Root Directory" es correcto

### "DATABASE_URL not found"
- Asegúrate que creaste la base de datos PostgreSQL
- Copia correctamente la DATABASE_URL

### "Frontend no puede conectar a Backend"
- Verifica que NEXT_PUBLIC_API_URL es correcto (URL pública de Railway)
- No uses localhost en producción
- Verifica CORS en backend/.env: FRONTEND_URL debe coincidir

### "Permission denied"
- Verifica permisos en GitHub para Railway
- Reconecta el repositorio

## 📊 Monitoreo

Railway te permite:
- Ver logs en tiempo real
- Monitorear CPU/Memory
- Ver histórico de deploys
- Alertas si algo falla

## 🎯 Checklist Final

- [ ] PostgreSQL creada en Railway
- [ ] Backend con variables de entorno configuradas
- [ ] Frontend con variables de entorno configuradas
- [ ] NEXT_PUBLIC_API_URL apunta a la URL de Railway del backend
- [ ] Primer push a GitHub
- [ ] Esperar a que Railway haga build y deploy
- [ ] Probar aplicación en URL pública

## 🚀 ¡Listo!

Tu aplicación ZYRA estará en línea y funcionando. Cualquier push a main automáticamente se desplegará.

¿Necesitas ayuda? Contacta al equipo 📧
