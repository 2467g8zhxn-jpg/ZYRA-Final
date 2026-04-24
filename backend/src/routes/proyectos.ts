import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, errorHandler } from '../middleware/auth.js';

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
        checklists: {
          include: {
            detalles: {
              include: { material: true }
            }
          }
        },
      },
    });
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (error) { errorHandler(error, req, res, () => { }); }
});

// POST /api/proyectos - Crear proyecto
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Nombre_Proyecto, ID_Cliente, ID_Servicio, ID_Equipo, Fecha_Inicio, Fecha_Fin, Estado, Tipo_Servicio, Imagen_Url, Ubicacion } = req.body;
    if (!Nombre_Proyecto) return res.status(400).json({ error: 'Nombre es requerido' });

    let finalIdServicio = ID_Servicio ? parseInt(ID_Servicio) : null;
    if (!finalIdServicio && Tipo_Servicio) {
      const serv = await prisma.servicios.findFirst({ where: { Tipo: Tipo_Servicio } });
      if (serv) finalIdServicio = serv.ID_Servicio;
    }

    const proyecto = await prisma.proyectos.create({
      data: {
        Nombre_Proyecto,
        ID_Cliente: ID_Cliente ? parseInt(ID_Cliente) : null,
        ID_Servicio: finalIdServicio,
        ID_Equipo: ID_Equipo ? parseInt(ID_Equipo) : null,
        Fecha_Inicio: Fecha_Inicio ? new Date(Fecha_Inicio) : null,
        Fecha_Fin: Fecha_Fin ? new Date(Fecha_Fin) : null,
        Estado: Estado || 'Planificacion',
        Imagen_Url: Imagen_Url || null,
        Ubicacion: Ubicacion || null,
      },
      include: { cliente: true, servicio: true, equipo: true }
    });
    res.status(201).json(proyecto);
  } catch (error) { errorHandler(error, req, res, () => { }); }
});

// PUT /api/proyectos/:id - Actualizar proyecto
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Nombre_Proyecto, ID_Cliente, ID_Servicio, ID_Equipo, Fecha_Inicio, Fecha_Fin, Estado, materiales, Imagen_Url, Ubicacion } = req.body;

    // Actualizar datos básicos
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
        ...(Imagen_Url !== undefined && { Imagen_Url }),
        ...(Ubicacion !== undefined && { Ubicacion }),
      },
      include: { cliente: true, servicio: true, equipo: true }
    });

    // Si vienen materiales (formato antiguo/relacional), sincronizamos el checklist
    if (materiales && materiales.length > 0) {
      // Buscar si ya tiene un checklist
      const existingChecklist = await prisma.checklist.findFirst({
        where: { ID_Proyecto: proyecto.ID_Proyecto }
      });

      if (existingChecklist) {
        // Sincronizar detalles (borrar y crear es lo más limpio para una plantilla)
        await prisma.checklist_Detalle.deleteMany({
          where: { ID_Checklist: existingChecklist.ID_Checklist }
        });

        await prisma.checklist_Detalle.createMany({
          data: materiales.map((m: any) => ({
            ID_Checklist: existingChecklist.ID_Checklist,
            ID_Material: m.ID_Material,
            Cantidad_Requerida: m.quantity || m.Cantidad_Requerida,
            Cantidad_Cargada: m.takenQuantity || m.Cantidad_Cargada || 0,
            Marcado: m.done || m.Marcado || false
          }))
        });
      } else {
        await prisma.checklist.create({
          data: {
            ID_Proyecto: proyecto.ID_Proyecto,
            Estado: 'Pendiente',
            detalles: {
              create: materiales.map((m: any) => ({
                ID_Material: m.ID_Material,
                Cantidad_Requerida: m.quantity || m.Cantidad_Requerida,
                Cantidad_Cargada: m.takenQuantity || 0,
                Marcado: m.done || false
              }))
            }
          }
        });
      }
    }

    // Soporte para el campo 'projectMaterials' que envía el frontend
    const { projectMaterials } = req.body;
    if (projectMaterials && projectMaterials.length > 0) {
      const existingChecklist = await prisma.checklist.findFirst({
        where: { ID_Proyecto: proyecto.ID_Proyecto }
      });

      if (existingChecklist) {
        await prisma.checklist_Detalle.deleteMany({
          where: { ID_Checklist: existingChecklist.ID_Checklist }
        });

        await prisma.checklist_Detalle.createMany({
          data: projectMaterials.map((m: any) => ({
            ID_Checklist: existingChecklist.ID_Checklist,
            ID_Material: m.ID_Material,
            Cantidad_Requerida: m.quantity || m.Cantidad_Requerida,
            Cantidad_Cargada: m.takenQuantity || m.Cantidad_Cargada || 0,
            Marcado: m.done || m.Marcado || false
          }))
        });
      } else {
        // CREAR SI NO EXISTE
        await prisma.checklist.create({
          data: {
            ID_Proyecto: proyecto.ID_Proyecto,
            Estado: 'Pendiente',
            detalles: {
              create: projectMaterials.map((m: any) => ({
                ID_Material: m.ID_Material,
                Cantidad_Requerida: m.quantity || m.Cantidad_Requerida,
                Cantidad_Cargada: m.takenQuantity || 0,
                Marcado: m.done || false
              }))
            }
          }
        });
      }
    }

    // ── GAMIFICACION: puntos al finalizar proyecto ──────────────────────
    if (Estado === 'Finalizado') {
      try {
        const proyectoConEquipo = await prisma.proyectos.findUnique({
          where: { ID_Proyecto: parseInt(req.params.id) },
          include: {
            equipo: { include: { empleados: true } }
          }
        });
        const miembros = proyectoConEquipo?.equipo?.empleados || [];
        console.log(`[GAMIFICACION] Finalizando proyecto. Otorgando puntos a ${miembros.length} miembro(s)`);

        for (const miembro of miembros) {
          if (!miembro.ID_Empleado) continue;
          await prisma.puntos_Historial.create({
            data: {
              ID_Empleado: miembro.ID_Empleado,
              Cantidad_Puntos: 50,
              Motivo: `Proyecto Finalizado: ${proyectoConEquipo?.Nombre_Proyecto || ''}`,
              ID_Proyecto: parseInt(req.params.id)
            }
          });
          console.log(`[GAMIFICACION] 100 pts -> empleado ${miembro.ID_Empleado}`);
        }
      } catch (gamErr) {
        console.error('[GAMIFICACION] Error otorgando puntos:', gamErr);
      }
    }

    res.json(proyecto);
  } catch (error) { errorHandler(error, req, res, () => { }); }
});

// DELETE /api/proyectos/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    
    // 1. Borrar detalles de checklists
    const checklists = await prisma.checklist.findMany({ where: { ID_Proyecto: projectId } });
    for (const cl of checklists) {
      await prisma.checklist_Detalle.deleteMany({ where: { ID_Checklist: cl.ID_Checklist } });
    }
    
    // 2. Borrar checklists
    await prisma.checklist.deleteMany({ where: { ID_Proyecto: projectId } });
    
    // 3. Borrar reportes
    await prisma.reportes.deleteMany({ where: { ID_Proyecto: projectId } });
    
    // 4. Borrar historial de puntos
    await prisma.puntos_Historial.deleteMany({ where: { ID_Proyecto: projectId } });

    // 5. Finalmente borrar el proyecto
    await prisma.proyectos.delete({
      where: { ID_Proyecto: projectId }
    });
    
    res.json({ message: 'Proyecto y datos relacionados eliminados' });
  } catch (error) { errorHandler(error, req, res, () => { }); }
});

export default router;