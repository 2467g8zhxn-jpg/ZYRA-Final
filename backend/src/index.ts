import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { PrismaClient } from "@prisma/client";
import clientesRouter from './routes/clientes.js';
import empleadosRouter from './routes/empleados.js';
import equiposRouter from './routes/equipos.js';
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/proyectos.js";
import reportRoutes from "./routes/reports.js";
import materialRoutes from "./routes/materiales.js";
import checklistServicioRouter from './routes/checklist_servicio.js';

dotenv.config();

// Initialize Firebase Admin
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  if (!admin.apps.length) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      // Only initialize if we don't have placeholder values
      if (!privateKey.includes('your-firebase')) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        });
        console.log("🔥 Firebase Admin initialized successfully");
      } else {
        console.warn("⚠️ Firebase Admin skip: Placeholder credentials detected in .env");
      }
    } catch (e) {
      console.warn("❌ Failed to initialize Firebase Admin:", e);
    }
  }
} else {
  console.warn("⚠️ Firebase Admin credentials not fully found in env, skipping initialization.");
}

const app: Express = express();
const port = process.env.PORT || 3001;

// Prisma
export const prisma = new PrismaClient();

// Middleware
app.use(
    cors({
        origin: true,
        credentials: true,
    }),
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check
app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", message: "ZYRA Backend is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/proyectos", projectRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/materiales", materialRoutes);
app.use("/api/clientes", clientesRouter);
app.use("/api/empleados", empleadosRouter);
app.use("/api/equipos", equiposRouter);
app.use("/api/checklists-servicio", checklistServicioRouter);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// Start server
app.listen(port, async () => {
    console.log(`🚀 ZYRA Backend listening on port ${port}`);
    
    try {
        // 1. Inicializar Roles si no existen
        const rolesCount = await prisma.roles.count();
        if (rolesCount === 0) {
            console.log("🌱 Creando roles iniciales...");
            await prisma.roles.createMany({
                data: [
                    { ID_Rol: 1, Nombre_Rol: 'admin' },
                    { ID_Rol: 2, Nombre_Rol: 'técnico' }
                ]
            });
        }

        // 2. Inicializar Empresa si no existe
        const empresaCount = await prisma.empresa.count();
        if (empresaCount === 0) {
            console.log("🌱 Creando empresa inicial...");
            await prisma.empresa.create({
                data: {
                    ID_Empresa: 1,
                    Nombre: 'Zyra Soluciones',
                    Direccion: 'Default Address',
                    Correo: 'admin@zyra.com',
                    Telefono: '0000000000'
                }
            });
        }

        // 3. Inicializar Servicios base si no existen
        const serviciosCount = await prisma.servicios.count();
        if (serviciosCount === 0) {
            console.log("🌱 Creando servicios base...");
            await prisma.servicios.createMany({
                data: [
                    { Tipo: 'Instalación', Descripcion: 'Proyectos de obra nueva', ID_Empresa: 1 },
                    { Tipo: 'Mantenimiento', Descripcion: 'Limpieza y revisión', ID_Empresa: 1 }
                ]
            });
        }

        // 4. Inicializar Usuario Admin si no hay usuarios
        const userCount = await prisma.usuarios.count();
        if (userCount === 0) {
            console.log("🌱 Creando usuario administrador por defecto...");
            const empleado = await prisma.empleados.create({
                data: {
                    Nombre: 'Administrador ZYRA',
                    Correo: 'admin@zyra.com',
                    ID_Empresa: 1
                }
            });
            await prisma.usuarios.create({
                data: {
                    Username: 'admin@zyra.com',
                    Password_Hash: 'admin123', // En producción usar hashing real
                    ID_Empleado: empleado.ID_Empleado,
                    ID_Rol: 1
                }
            });
            console.log("✅ Acceso admin creado: admin@zyra.com / admin123");
        }

    } catch (err) {
        console.warn("⚠️ Error en auto-inicialización:", err);
    }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, closing gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});
