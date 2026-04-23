import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, errorHandler } from '../middleware/auth.js';

const router = Router();

// GET /api/materiales
router.get('/', async (req: Request, res: Response) => {
    try {
        const materiales = await prisma.materiales.findMany({ orderBy: { ID_Material: 'desc' } });
        res.json(materiales);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// GET /api/materiales/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const material = await prisma.materiales.findUnique({
            where: { ID_Material: parseInt(id) },
        });
        if (!material) return res.status(404).json({ error: 'Material no encontrado' });
        res.json(material);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// POST /api/materiales
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { Nombre_Material, Stock_Disponible } = req.body;
        if (!Nombre_Material) return res.status(400).json({ error: 'Nombre es requerido' });
        const material = await prisma.materiales.create({
            data: { Nombre_Material, Stock_Disponible: Stock_Disponible || 0 }
        });
        res.status(201).json(material);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// PUT /api/materiales/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { Nombre_Material, Stock_Disponible } = req.body;
        const material = await prisma.materiales.update({
            where: { ID_Material: parseInt(req.params.id) },
            data: { Nombre_Material, Stock_Disponible }
        });
        res.json(material);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// DELETE /api/materiales/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        await prisma.materiales.delete({ where: { ID_Material: parseInt(req.params.id) } });
        res.json({ message: 'Material eliminado' });
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

export default router;
