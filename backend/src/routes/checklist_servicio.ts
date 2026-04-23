import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, errorHandler } from '../middleware/auth';

const router = Router();

// GET /api/checklists-servicio - Obtener todas las plantillas con sus materiales
router.get('/', async (req: Request, res: Response) => {
    try {
        const checklists = await prisma.checklist_Servicio.findMany({
            include: {
                detalles: {
                    include: { material: true }
                },
                servicio: true
            }
        });
        res.json(checklists);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// GET /api/checklists-servicio/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const checklist = await prisma.checklist_Servicio.findUnique({
            where: { ID_Checklist_Servicio: parseInt(id) },
            include: {
                detalles: {
                    include: { material: true }
                },
                servicio: true
            }
        });
        if (!checklist) return res.status(404).json({ error: 'Plantilla no encontrada' });
        res.json(checklist);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// PUT /api/checklists-servicio/:id - Sincronizar materiales de la plantilla
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { materiales } = req.body; // Array de { ID_Material, Cantidad_Requerida }
        
        const checklistId = parseInt(id);

        const updated = await prisma.$transaction(async (tx) => {
            // 1. Limpiar detalles actuales
            await tx.checklist_Servicio_Detalle.deleteMany({
                where: { ID_Checklist_Servicio: checklistId }
            });

            // 2. Crear nuevos detalles si hay
            if (materiales && materiales.length > 0) {
                await tx.checklist_Servicio_Detalle.createMany({
                    data: materiales.map((m: any) => ({
                        ID_Checklist_Servicio: checklistId,
                        ID_Material: m.ID_Material,
                        Cantidad_Requerida: m.Cantidad_Requerida
                    }))
                });
            }

            return tx.checklist_Servicio.findUnique({
                where: { ID_Checklist_Servicio: checklistId },
                include: {
                    detalles: {
                        include: { material: true }
                    }
                }
            });
        });

        res.json(updated);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

export default router;
