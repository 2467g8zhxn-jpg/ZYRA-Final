import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, errorHandler } from '../middleware/auth.js';

const router = Router();

// ─────────────────────────────────────────────────
// GET /api/reports - Obtener todos los reportes
// ─────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
    try {
        const { projectId, estado } = req.query;

        const where: any = {};
        if (projectId) where.ID_Proyecto = parseInt(projectId as string);
        if (estado) where.estado = estado as string;

        const reports = await prisma.reportes.findMany({
            where,
            include: {
                proyecto: true,
                equipo: true,
                empleado: true
            },
            orderBy: {
                Fecha_Reporte: 'desc',
            },
        });

        res.json(reports);
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

// ─────────────────────────────────────────────────
// GET /api/reports/:id - Obtener reporte por ID
// ─────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const report = await prisma.reportes.findUnique({
            where: { ID_Reporte: parseInt(id) },
            include: {
                proyecto: true,
                equipo: true,
                empleado: true
            },
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

// ─────────────────────────────────────────────────
// POST /api/reports - Crear nuevo reporte
// ─────────────────────────────────────────────────
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { ID_Proyecto, ID_Equipo, Comentarios, Evidencias_URL, ID_Empleado, estado = 'Pendiente' } = req.body;

        if (!ID_Proyecto && !ID_Equipo) {
            return res.status(400).json({ error: 'ID_Proyecto o ID_Equipo son requeridos' });
        }

        const report = await prisma.reportes.create({
            data: {
                ID_Proyecto: ID_Proyecto ? parseInt(ID_Proyecto) : null,
                ID_Equipo: ID_Equipo ? parseInt(ID_Equipo) : null,
                Comentarios,
                Evidencias_URL,
                estado,
                ID_Empleado: ID_Empleado ? parseInt(ID_Empleado) : null,
            },
            include: {
                proyecto: true,
                equipo: true,
                empleado: true
            },
        });

        res.status(201).json(report);
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});


// ─────────────────────────────────────────────────
// PUT /api/reports/:id - Actualizar reporte
// ─────────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { Comentarios, Evidencias_URL, estado } = req.body;

        const report = await prisma.reportes.update({
            where: { ID_Reporte: parseInt(id) },
            data: {
                ...(Comentarios && { Comentarios }),
                ...(Evidencias_URL && { Evidencias_URL }),
                ...(estado && { estado }),
            },
            include: {
                proyecto: true,
                equipo: true,
                empleado: true
            },
        });

        res.json(report);
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

// ─────────────────────────────────────────────────
// DELETE /api/reports/:id - Eliminar reporte
// ─────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.reportes.delete({
            where: { ID_Reporte: parseInt(id) },
        });

        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

export default router;
