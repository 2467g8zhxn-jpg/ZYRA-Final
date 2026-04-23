import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, errorHandler } from '../middleware/auth';

const router = Router();

// GET /api/proyectos - Obtener todos los proyectos
router.get('/', async (req: Request, res: Response) => {
  try {
    const proyectos = await prisma.proyectos.findMany({
      include: {
        cliente: true,
        servicio: true,
        equipo: true,
      },
      orderBy: { ID_Proyecto: 'desc' }
    });
    res.json(proyectos);
  } catch (error) { errorHandler(error, req, res, () => { }); }
});

// GET /api/proyectos/:id - Obtener un proyecto
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const proyecto = await prisma.proyectos.findUnique({
      where: { ID_Proyecto: parseInt(req.params.id) },
      include: {
        cliente: true,
        servicio: true,
        equipo: true,
        reportes: true,
        checklists: true,
      },
    });
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (error) { errorHandler(error, req, res, () => { }); }
});

// POST /api/proyectos - Crear proyecto
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Nombre_Proyecto, ID_Cliente, ID_Servicio, ID_Equipo, Fecha_Inicio, Fecha_Fin, Estado } = req.body;
    if (!Nombre_Proyecto) return res.status(400).json({ error: 'Nombre es requerido' });
    const proyecto = await prisma.proyectos.create({
      data: {
        Nombre_Proyecto,
        ID_Cliente: ID_Cliente ? parseInt(ID_Cliente) : null,
        ID_Servicio: ID_Servicio ? parseInt(ID_Servicio) : null,
        ID_Equipo: ID_Equipo ? parseInt(ID_Equipo) : null,
        Fecha_Inicio: Fecha_Inicio ? new Date(Fecha_Inicio) : null,
        Fecha_Fin: Fecha_Fin ? new Date(Fecha_Fin) : null,
        Estado: Estado || 'Planificación',
      },
      include: { cliente: true, servicio: true, equipo: true }
    });
    res.status(201).json(proyecto);
  } catch (error) { errorHandler(error, req, res, () => { }); }
});

// PUT /api/proyectos/:id - Actualizar proyecto
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Nombre_Proyecto, ID_Cliente, ID_Servicio, ID_Equipo, Fecha_Inicio, Fecha_Fin, Estado } = req.body;
    const proyecto = await prisma.proyectos.update({
      where: { ID_Proyecto: parseInt(req.params.id) },
      data: {
        ...(Nombre_Proyecto && { Nombre_Proyecto }),
        ...(ID_Cliente && { ID_Cliente: parseInt(ID_Cliente) }),
        ...(ID_Servicio && { ID_Servicio: parseInt(ID_Servicio) }),
        ...(ID_Equipo && { ID_Equipo: parseInt(ID_Equipo) }),
        ...(Fecha_Inicio && { Fecha_Inicio: new Date(Fecha_Inicio) }),
        ...(Fecha_Fin && { Fecha_Fin: new Date(Fecha_Fin) }),
        ...(Estado && { Estado }),
      },
      include: { cliente: true, servicio: true, equipo: true }
    });
    res.json(proyecto);
  } catch (error) { errorHandler(error, req, res, () => { }); }
});

// DELETE /api/proyectos/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.proyectos.delete({ where: { ID_Proyecto: parseInt(req.params.id) } });
    res.json({ message: 'Proyecto eliminado' });
  } catch (error) { errorHandler(error, req, res, () => { }); }
});

export default router;