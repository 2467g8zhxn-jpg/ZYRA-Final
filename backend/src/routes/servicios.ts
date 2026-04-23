import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, errorHandler } from '../middleware/auth.js';

const router = Router();

// GET /api/servicios - Obtener todos los servicios
router.get('/', async (req: Request, res: Response) => {
    try {
        const servicios = await prisma.servicios.findMany({
            include: { empresa: true }
        });
        res.json(servicios);
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

// POST /api/servicios - Crear un nuevo servicio
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { Tipo, Descripcion, ID_Empresa } = req.body;
        
        // Si no se envía ID_Empresa, usamos el 1 por defecto (tu empresa)
        const servicio = await prisma.servicios.create({
            data: {
                Tipo,
                Descripcion,
                ID_Empresa: ID_Empresa || 1
            }
        });
        res.status(201).json(servicio);
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

// DELETE /api/servicios/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.servicios.delete({
            where: { ID_Servicio: parseInt(id) }
        });
        res.status(204).send();
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

export default router;
