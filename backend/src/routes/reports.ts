import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, errorHandler } from '../middleware/auth.js';

const router = Router();

// GET /api/reports - Obtener todos los reportes
router.get('/', async (req: Request, res: Response) => {
    try {
        const reportes = await prisma.reportes.findMany({
            include: {
                proyecto: true,
                equipo: true,
                empleado: true
            },
            orderBy: { Fecha_Reporte: 'desc' }
        });
        res.json(reportes);
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

// GET /api/reports/:id - Obtener un reporte por ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const report = await prisma.reportes.findUnique({
            where: { ID_Reporte: parseInt(id) },
            include: {
                proyecto: true,
                equipo: true,
                empleado: true
            }
        });
        if (!report) return res.status(404).json({ error: 'Reporte no encontrado' });
        res.json(report);
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

// POST /api/reports - Crear un nuevo reporte
router.post('/', async (req: Request, res: Response) => {
    try {
        const { ID_Proyecto, ID_Equipo, Comentarios, Evidencias_URL, ID_Empleado, estado = 'Pendiente' } = req.body;

        if (!ID_Proyecto && !ID_Equipo) {
            return res.status(400).json({ error: 'ID_Proyecto o ID_Equipo son requeridos' });
        }

        const empId = (ID_Empleado && !isNaN(parseInt(ID_Empleado))) ? parseInt(ID_Empleado) : null;

        const report = await prisma.reportes.create({
            data: {
                ID_Proyecto: ID_Proyecto ? parseInt(ID_Proyecto) : null,
                ID_Equipo: ID_Equipo ? parseInt(ID_Equipo) : null,
                Comentarios,
                Evidencias_URL,
                estado,
                ID_Empleado: empId
            } as any,
            include: {
                proyecto: true,
                equipo: true,
            },
        });

        res.status(201).json(report);

    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

// PUT /api/reports/:id - Actualizar estado del reporte
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { estado, Comentarios } = req.body;

        const report = await prisma.reportes.update({
            where: { ID_Reporte: parseInt(id) },
            data: { 
                ...(estado && { estado }),
                ...(Comentarios && { Comentarios })
            }
        });

        res.json(report);
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

// ─────────────────────────────────────────────────
// DELETE /api/reports/:id - Eliminar reporte (+ puntos en cascada)
// ─────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const reportId = parseInt(id);

        if (isNaN(reportId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        // 1. Buscar el reporte para saber a qué proyecto pertenece
        const report = await prisma.reportes.findUnique({
            where: { ID_Reporte: reportId }
        });

        if (report?.ID_Proyecto) {
            console.log(`[GAMIFICACIÓN] Borrando puntos de todo el equipo para el proyecto ${report.ID_Proyecto} debido a eliminación de reporte.`);
            // 2. Borrar puntos de TODO el equipo asociados a este proyecto
            await prisma.puntos_Historial.deleteMany({
                where: { ID_Proyecto: report.ID_Proyecto }
            }).catch(() => { /* ignorar si no hay puntos */ });
        }

        // 3. Borrar el reporte
        await prisma.reportes.delete({
            where: { ID_Reporte: reportId },
        });

        res.json({ message: 'Reporte eliminado correctamente' });
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

export default router;
