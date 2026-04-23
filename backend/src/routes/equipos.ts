import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { errorHandler } from '../middleware/auth';

const router = Router();

// GET /api/equipos - Obtener todos los equipos
router.get('/', async (req: Request, res: Response) => {
    try {
        const equipos = await prisma.equipos.findMany({
            include: { empleados: { include: { empleado: true } } },
            orderBy: { ID_Equipo: 'desc' }
        });
        res.json(equipos);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// GET /api/equipos/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const equipo = await prisma.equipos.findUnique({
            where: { ID_Equipo: parseInt(req.params.id) },
            include: { empleados: { include: { empleado: true } } }
        });
        if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
        res.json(equipo);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// POST /api/equipos
router.post('/', async (req: Request, res: Response) => {
    try {
        const { Nombre_Equipo, integrantes, Tipo: tipoEquipo, ID_Lider } = req.body;
        if (!Nombre_Equipo) return res.status(400).json({ error: 'Nombre es requerido' });
        
        const equipo = await prisma.equipos.create({
            data: { 
                Nombre_Equipo,
                // @ts-ignore
                Tipo: tipoEquipo,
                empleados: {
                    create: integrantes?.map((id: number) => ({
                        ID_Empleado: id,
                        Cargo: id === ID_Lider ? 'Líder' : null
                    })) || []
                }
            },
            include: { empleados: { include: { empleado: true } } }
        });
        res.status(201).json(equipo);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// PUT /api/equipos/:id
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { Nombre_Equipo, integrantes, Tipo: tipoEquipo, ID_Lider } = req.body;
        const equipoId = parseInt(id);

        const equipo = await prisma.$transaction(async (tx) => {
            const relModel = (tx as any).empleado_Equipo || (tx as any).empleados_Equipos || (tx as any).empleado_Equipos;
            
            if (integrantes && relModel) {
                // Eliminar integrantes anteriores
                await relModel.deleteMany({ where: { ID_Equipo: equipoId } });
                
                // Crear nuevos integrantes
                await relModel.createMany({
                    data: integrantes.map((empId: number) => ({
                        ID_Equipo: equipoId,
                        ID_Empleado: empId,
                        Cargo: empId === ID_Lider ? 'Líder' : null
                    }))
                });
            }

            // Actualizar datos del equipo
            return await tx.equipos.update({
                where: { ID_Equipo: equipoId },
                data: { 
                    ...(Nombre_Equipo && { Nombre_Equipo }),
                    // @ts-ignore
                    ...(tipoEquipo !== undefined && { Tipo: tipoEquipo })
                },
                include: { empleados: { include: { empleado: true } } }
            });
        });

        res.json(equipo);
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

// DELETE /api/equipos/:id
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.equipos.delete({ where: { ID_Equipo: parseInt(id) } });
        res.json({ message: 'Equipo eliminado correctamente' });
    } catch (error) { errorHandler(error, req, res, () => { }); }
});

export default router;
