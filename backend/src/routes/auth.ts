import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        console.log('[AUTH] Login attempt — email:', email, '| password provided:', !!password);

        if (!email || !password) {
            console.log('[AUTH] Missing email or password — aborting');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Buscar el usuario por Username (el campo en la BD que actúa como correo/email)
        console.log('[AUTH] Searching for user with Username:', email);
        const user = await prisma.usuarios.findFirst({
            where: { Username: email },
            include: {
                empleado: true,
                rol: true,
            },
        });

        if (!user) {
            console.log('[AUTH] No user found for Username:', email);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        console.log('[AUTH] User found — ID:', user.ID_Usuario, '| Username:', user.Username, '| Rol:', user.rol?.Nombre_Rol ?? 'none');

        // En un sistema real usaríamos bcrypt, pero aquí verificamos como está guardado
        const passwordMatch = user.Password_Hash === password;
        console.log('[AUTH] Password comparison result:', passwordMatch, '| Stored hash length:', user.Password_Hash?.length, '| Provided password length:', password.length);

        if (!passwordMatch) {
            console.log('[AUTH] Password mismatch for user:', email);
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
        console.error('[AUTH] Unexpected error during login:', error);
        if (error instanceof Error) {
            console.error('[AUTH] Error name:', error.name, '| message:', error.message);
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;
