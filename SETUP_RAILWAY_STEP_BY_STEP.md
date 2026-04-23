# 🚀 Deploy ZYRA a Railway en 10 minutos

Railway es la forma más rápida de deployar sin instalar PostgreSQL localmente.

## ✅ Prerequisitos

- ✅ Código en GitHub (público o privado)
- ✅ Cuenta en GitHub (para conectar)
- ✅ Eso es todo!

## 📋 Paso a Paso

### **Paso 1: Crear cuenta en Railway (2 min)**

1. Abre https://railway.app
2. Click en "Start Free"
3. Conecta con tu cuenta GitHub (autoriza Railway)
4. Selecciona o crea un nuevo proyecto

### **Paso 2: Crear Base de Datos PostgreSQL (1 min)**

1. En tu proyecto Railway, click en "+ New"
2. Busca "PostgreSQL"
3. Click en "PostgreSQL"
4. **No configures nada, Railway lo hace automáticamente**

Espera a que se cree (~30 segundos). Verás:
```
✓ PostgreSQL está creada
✓ DATABASE_URL generada automáticamente
```

### **Paso 3: Deploy del Backend (3 min)**

#### 3.1 Conectar repositorio GitHub

1. En tu proyecto Railway, click en "+ New"
2. Selecciona "GitHub Repo"
3. Autoriza Railway en GitHub
4. Selecciona el repositorio `ZYRA-main`
5. En "Reference" (rama): selecciona `main`
6. En "Root Directory": escribe `backend`
7. Click en "Deploy"

Railway automáticamente:
- ✅ Detecta que es Node.js
- ✅ Instala dependencias
- ✅ Compila TypeScript
- ✅ Ejecuta migraciones de Prisma
- ✅ Inicia el servidor

#### 3.2 Configurar Variables de Entorno del Backend

Mientras se deploy, configura variables:

1. En la tarjeta del servicio "backend", click en "Variables"
2. Añade estas variables (Railway generará muchas automáticamente):

```env
NODE_ENV=production
JWT_SECRET=tu-secret-super-seguro-cambiar-esto
FIREBASE_PROJECT_ID=studio-162226445-90191
FIREBASE_PRIVATE_KEY=<tu-firebase-private-key>
FIREBASE_CLIENT_EMAIL=<tu-firebase-client-email>
PORT=3001
```

La `DATABASE_URL` se inyecta automáticamente desde PostgreSQL.

#### 3.3 Obtener URL del Backend

Después de deploy exitoso:
1. En la tarjeta "backend", haz click en la pestaña "Deployments"
2. Busca el URL público (ej: `https://zyra-backend.up.railway.app`)
3. **Copia este URL, lo necesitarás para el frontend**

### **Paso 4: Deploy del Frontend (3 min)**

#### 4.1 Conectar repositorio GitHub

1. En tu proyecto Railway, click en "+ New"
2. Selecciona "GitHub Repo" (de nuevo)
3. Selecciona el repositorio `ZYRA-main`
4. En "Root Directory": dejar vacío (raíz)
5. Click en "Deploy"

Railway detecta Next.js automáticamente.

#### 4.2 Configurar Variables de Entorno del Frontend

En la tarjeta del servicio "frontend", click en "Variables" y añade:

```env
# Firebase (iguales que tienes ahora)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC09OpUDW_gjWwe1uvRgF3BWPysxb3O7Q4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-162226445-90191.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-162226445-90191
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-162226445-90191.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=943256965880
NEXT_PUBLIC_FIREBASE_APP_ID=1:943256965880:web:aa591804bd6b9d7a8a210d

# API - IMPORTANTE: usa la URL del backend que copiaste en Paso 3.3
NEXT_PUBLIC_API_URL=https://zyra-backend.up.railway.app/api
```

#### 4.3 Obtener URL del Frontend

Después de deploy:
1. URL público (ej: `https://zyra-frontend.up.railway.app`)

### **Paso 5: Actualizar Backend CORS (1 min)**

Ahora que tienes la URL del frontend, actualiza el backend:

1. En la tarjeta "backend", click en "Variables"
2. Busca o crea la variable `FRONTEND_URL`
3. Cambia a tu URL del frontend: `https://zyra-frontend.up.railway.app`
4. Railway automáticamente redeploy (restart)

---

## 🎉 ¡Listo!

Tu aplicación ZYRA está en línea:
- 🌐 Frontend: https://zyra-frontend.up.railway.app
- 🔌 Backend API: https://zyra-backend.up.railway.app
- 📊 Database: PostgreSQL en Railway

---

## 🔄 Actualizar código

```bash
# En tu máquina local
git add .
git commit -m "Cambios a ZYRA"
git push origin main

# Railway automáticamente:
# 1. Detecta el push
# 2. Compila código
# 3. Ejecuta migraciones (si hay cambios en schema.prisma)
# 4. Reinicia servidor
# TODO en ~2-5 minutos
```

---

## 📊 Ver Logs

En Railway:
1. Click en la tarjeta del servicio
2. Tab "Logs"
3. Ves todo en tiempo real

---

## 🐛 Troubleshooting

### "Build Failed"
- Mira los logs en Railway
- Generalmente es error de sintaxis o variable faltante

### "Database connection error"
- Verifica que `DATABASE_URL` existe en variables
- Si no, Railway conecta automáticamente de PostgreSQL

### "CORS error en frontend"
- Verifica `FRONTEND_URL` en backend
- Debe coincidir exactamente con URL del frontend
- Restart backend después de cambiar

### "Cannot find module 'prisma'"
- Es error de build
- Mira que `postinstall` script corra
- Verifica package.json tiene Prisma en dependencies

---

## 💰 Costos

| Servicio | Costo |
|----------|-------|
| PostgreSQL | $7/mes (o gratis con crédito) |
| Backend Node.js | $5-10/mes |
| Frontend Next.js | $5-10/mes |
| **Total** | ~$15-20/mes |

Railway da crédito $5/mes a nuevas cuentas.

---

## ✅ Checklist Final

- [ ] Cuenta Railway creada
- [ ] PostgreSQL creada
- [ ] Backend deployado
- [ ] Backend variables configuradas
- [ ] Frontend deployado
- [ ] Frontend variables configuradas
- [ ] URLs copiadas en ambos lados
- [ ] Primer push a GitHub
- [ ] Ambos deploys exitosos
- [ ] ¡Aplicación en línea!

---

## 📞 Si algo no funciona

1. **Verifica logs** en Railway
2. **Comprueba variables** están correctas
3. **Reinicia servicio**: Railway → More → Restart
4. **Redeploy manual**: Click en el botón "Redeploy"

---

¡Tu ZYRA está en la nube! 🚀
