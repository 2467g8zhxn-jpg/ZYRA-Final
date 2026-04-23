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
      if (!privateKey.includes('your-firebase')) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        });
        console.log("🔥 Firebase Admin initialized successfully");
      }
    } catch (e) {
      console.warn("❌ Failed to initialize Firebase Admin:", e);
    }
  }
}

const app: Express = express();
const port = process.env.PORT || 3001;

// Prisma
export const prisma = new PrismaClient();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Root
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "ZYRA Backend API is running" });
});

// Initialization Logic
async function initializeDatabase() {
    try {
        console.log("🔍 Checking database initialization...");
        
        const rolesCount = await prisma.roles.count();
        if (rolesCount === 0) {
            await prisma.roles.createMany({
                data: [
                    { ID_Rol: 1, Nombre_Rol: 'admin' },
                    { ID_Rol: 2, Nombre_Rol: 'técnico' }
                ]
            });
            console.log("🌱 Roles initialized");
        }

        const empresaCount = await prisma.empresa.count();
        if (empresaCount === 0) {
            await prisma.empresa.create({
                data: {
                    ID_Empresa: 1,
                    Nombre: 'Zyra Soluciones',
                    Direccion: 'Default',
                    Correo: 'admin@zyra.com',
                    Telefono: '0000000000'
                }
            });
            console.log("🌱 Empresa initialized");
        }

        const serviciosCount = await prisma.servicios.count();
        if (serviciosCount === 0) {
            await (prisma.servicios as any).createMany({
                data: [
                    { Tipo: 'Instalación', Descripcion: 'Proyectos de obra nueva', ID_Empresa: 1 },
                    { Tipo: 'Mantenimiento', Descripcion: 'Limpieza y revisión', ID_Empresa: 1 }
                ]
            });
            console.log("🌱 Services initialized");
        }

        const userCount = await prisma.usuarios.count();
        if (userCount === 0) {
            const empleado = await prisma.empleados.create({
                data: { Nombre: 'Admin', Correo: 'admin@zyra.com', ID_Empresa: 1 }
            });
            await prisma.usuarios.create({
                data: {
                    Username: 'admin@zyra.com',
                    Password_Hash: 'admin123',
                    ID_Empleado: empleado.ID_Empleado,
                    ID_Rol: 1
                }
            });
            console.log("🌱 Default admin created: admin@zyra.com / admin123");
        }
        console.log("✅ Database check complete");
    } catch (err) {
        console.error("❌ Init error:", err);
    }
}

// Start server
app.listen(port, () => {
    console.log(`🚀 ZYRA Backend listening on port ${port}`);
    initializeDatabase();
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});
