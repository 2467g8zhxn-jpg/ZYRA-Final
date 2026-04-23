import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, errorHandler } from '../middleware/auth.js';

const router = Router();

// ─────────────────────────────────────────────────
// GET /api/users - Obtener todos los usuarios
// ─────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await prisma.usuarios.findMany({
            include: {
                empleado: true,
                rol: true,
            },
        });
        res.json(users);
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

// ─────────────────────────────────────────────────
// GET /api/users/:id - Obtener un usuario por ID
// ─────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.usuarios.findUnique({
            where: { ID_Usuario: parseInt(id) },
            include: {
                empleado: true,
                rol: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

// ─────────────────────────────────────────────────
// POST /api/users - Crear un nuevo usuario
// ─────────────────────────────────────────────────
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { Username, Password_Hash, ID_Empleado, ID_Rol } = req.body;

        if (!Username || !Password_Hash) {
            return res.status(400).json({ error: 'Username and Password_Hash are required' });
        }

        const user = await prisma.usuarios.create({
            data: {
                Username,
                Password_Hash,
                ID_Empleado: ID_Empleado ? parseInt(ID_Empleado) : null,
                ID_Rol: ID_Rol ? parseInt(ID_Rol) : null,
            },
            include: {
                empleado: true,
                rol: true,
            },
        });

        res.status(201).json(user);
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

// ─────────────────────────────────────────────────
// PUT /api/users/:id - Actualizar usuario
// ─────────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { Username, Password_Hash, ID_Empleado, ID_Rol } = req.body;

        const user = await prisma.usuarios.update({
            where: { ID_Usuario: parseInt(id) },
            data: {
                ...(Username && { Username }),
                ...(Password_Hash && { Password_Hash }),
                ...(ID_Empleado && { ID_Empleado: parseInt(ID_Empleado) }),
                ...(ID_Rol && { ID_Rol: parseInt(ID_Rol) }),
            },
            include: {
                empleado: true,
                rol: true,
            },
        });

        res.json(user);
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

// ─────────────────────────────────────────────────
// DELETE /api/users/:id - Eliminar usuario
// ─────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.usuarios.delete({
            where: { ID_Usuario: parseInt(id) },
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        errorHandler(error, req, res, () => { });
    }
});

export default router;
