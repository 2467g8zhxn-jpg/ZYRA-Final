import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { errorHandler } from '../middleware/auth.js';

const router = Router();

// GET /api/empleados - Obtener todos los empleados
router.get('/', async (req: Request, res: Response) => {
    try {
        const empleados = await prisma.empleados.findMany({
            include: { empresa: true, usuario: true, puntos: true },
            orderBy: { ID_Empleado: 'desc' }
        });
        res.json(empleados);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// GET /api/empleados/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const empleado = await prisma.empleados.findUnique({
            where: { ID_Empleado: parseInt(req.params.id) },
            include: { empresa: true, usuario: true, puntos: true }
        });
        if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
        res.json(empleado);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// POST /api/empleados
router.post('/', async (req: Request, res: Response) => {
    try {
        const { Nombre, ID_Empresa, Telefono, Correo } = req.body;
        if (!Nombre || !ID_Empresa) return res.status(400).json({ error: 'Nombre e ID_Empresa son requeridos' });

        // Generar credenciales automáticas
        const tempPassword = Math.random().toString(36).slice(-8) + '!';
        const nameParts = Nombre.toLowerCase().split(' ');
        const usernamePrefix = nameParts.length > 1 
            ? `${nameParts[0][0]}${nameParts[1]}`.replace(/[^a-z0-9]/g, '')
            : nameParts[0].replace(/[^a-z0-9]/g, '');
        
        // Agregar sufijo aleatorio para asegurar unicidad del correo de acceso
        const uniqueSuffix = Math.floor(Math.random() * 900) + 100;
        const accessEmail = `${usernamePrefix}${uniqueSuffix}@zyra.com`;

        // Transacción para crear empleado y su usuario asociado
        const result = await prisma.$transaction(async (tx) => {
            const empleado = await tx.empleados.create({
                data: {
                    Nombre,
                    ID_Empresa: parseInt(ID_Empresa),
                    Telefono,
                    Correo
                }
            });

            const usuario = await tx.usuarios.create({
                data: {
                    Username: accessEmail,
                    Password_Hash: tempPassword,
                    ID_Empleado: empleado.ID_Empleado,
                    ID_Rol: 2 // Rol de Técnico
                }
            });

            const fullEmpleado = await tx.empleados.findUnique({
                where: { ID_Empleado: empleado.ID_Empleado },
                include: { empresa: true, usuario: true }
            });

            return { empleado: fullEmpleado, accessEmail, tempPassword };
        });

        console.log("Empleado creado con éxito:", result.accessEmail);
        res.status(201).json(result);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// PUT /api/empleados/:id
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { Nombre, ID_Empresa, Telefono, Correo } = req.body;
        
        const empleado = await prisma.empleados.update({
            where: { ID_Empleado: parseInt(id) },
            data: {
                ...(Nombre && { Nombre }),
                ...(ID_Empresa && { ID_Empresa: parseInt(ID_Empresa) }),
                ...(Telefono && { Telefono }),
                ...(Correo && { Correo }),
            }
        });
        res.json(empleado);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// DELETE /api/empleados/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.empleados.delete({ where: { ID_Empleado: parseInt(id) } });
        res.json({ message: 'Empleado eliminado correctamente' });
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// POST /api/empleados/:id/puntos
router.post('/:id/puntos', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { puntos, motivo, projectId, reportId } = req.body;
        
        if (!puntos) return res.status(400).json({ error: 'Faltan puntos' });

        let empId: number | null = null;
        
        // Resolución de Identidad Flexible
        if (!isNaN(parseInt(id))) {
            empId = parseInt(id);
        } else {
            // Si el ID no es numérico, buscar por nombre o username
            const foundEmp = await prisma.empleados.findFirst({
                where: {
                    OR: [
                        { Nombre: { contains: id, mode: 'insensitive' } },
                        { usuario: { Username: { contains: id, mode: 'insensitive' } } }
                    ]
                }
            });
            if (foundEmp) empId = foundEmp.ID_Empleado;
        }

        if (!empId) {
            return res.status(404).json({ error: 'Empleado no encontrado para asignar puntos' });
        }

        const pts = parseInt(puntos);
        if (isNaN(pts)) return res.status(400).json({ error: 'Cantidad de puntos inválida' });

        const history = await prisma.puntos_Historial.create({
            data: {
                ID_Empleado: empId,
                Cantidad_Puntos: pts,
                Motivo: motivo || 'Acción',
                ID_Proyecto: (projectId && !isNaN(parseInt(projectId))) ? parseInt(projectId) : null,
                ID_Reporte: (reportId && !isNaN(parseInt(reportId))) ? parseInt(reportId) : null,
                Fecha_Asignacion: new Date()
            }
        });

        res.status(201).json(history);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

export default router;
