import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Buscar el usuario por Username (el campo en la BD que actúa como correo/email)
        const user = await prisma.usuarios.findFirst({
            where: { Username: email },
            include: {
                empleado: true,
                rol: true,
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // En un sistema real usaríamos bcrypt, pero aquí verificamos como está guardado
        if (user.Password_Hash !== password) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar JWT
        const token = jwt.sign(
            {
                uid: user.ID_Usuario.toString(), // Para compatibilidad con algunos campos
                userId: user.ID_Usuario,
                email: user.Username,
                rol: user.rol?.Nombre_Rol?.toLowerCase() || 'tecnico',
                empleadoId: user.ID_Empleado,
            },
            process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production',
            { expiresIn: '7d' }
        );

        // Devolver token y datos básicos del usuario
        res.json({
            token,
            user: {
                uid: user.ID_Usuario.toString(),
                email: user.Username,
                displayName: user.empleado?.Nombre || user.Username,
                rol: user.rol?.Nombre_Rol?.toLowerCase() || 'tecnico',
                photoURL: null
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;
