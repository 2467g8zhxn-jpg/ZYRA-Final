import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, errorHandler } from '../middleware/auth.js';

const router = Router();

// GET /api/clientes - Obtener todos los clientes
router.get('/', async (req: Request, res: Response) => {
    try {
        const clientes = await prisma.clientes.findMany({
            include: { proyectos: true },
            orderBy: { ID_Cliente: 'desc' }
        });
        res.json(clientes);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// GET /api/clientes/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const cliente = await prisma.clientes.findUnique({
            where: { ID_Cliente: parseInt(req.params.id) },
            include: { proyectos: true }
        });
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(cliente);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// POST /api/clientes - Crear cliente
router.post('/', async (req: Request, res: Response) => {
    try {
        const { Nombre, RazonSocial, Correo, Direccion, Telefono } = req.body;
        if (!Nombre) return res.status(400).json({ error: 'Nombre es requerido' });
        
        const cliente = await prisma.clientes.create({
            data: {
                Nombre,
                RazonSocial,
                Correo,
                Direccion,
                Telefono
            }
        });
        res.status(201).json(cliente);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// PUT /api/clientes/:id - Actualizar
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { Nombre, RazonSocial, Correo, Direccion, Telefono } = req.body;
        
        const cliente = await prisma.clientes.update({
            where: { ID_Cliente: parseInt(id) },
            data: {
                ...(Nombre && { Nombre }),
                ...(RazonSocial && { RazonSocial }),
                ...(Correo && { Correo }),
                ...(Direccion && { Direccion }),
                ...(Telefono && { Telefono }),
            }
        });
        res.json(cliente);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// DELETE /api/clientes/:id - Eliminar
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.clientes.delete({ where: { ID_Cliente: parseInt(id) } });
        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

export default router;
