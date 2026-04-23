import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

import jwt from 'jsonwebtoken';

// Middleware para validar JWT token
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Decodificar el JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production');
    
    // Adjuntamos el usuario decodificado al request
    (req as any).user = decoded;
    
    // Para mantener retrocompatibilidad temporal si algún lugar busca firebaseToken
    (req as any).firebaseToken = token;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// Middleware para capturar errores
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' });
  }
  
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }

  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}
