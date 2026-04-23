
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const checklistId = 2; // Mantenimiento
  console.log('--- Initial Data ---');
  const c1 = await prisma.checklist_Servicio.findUnique({
    where: { ID_Checklist_Servicio: checklistId },
    include: { detalles: true }
  });
  console.log(JSON.stringify(c1.detalles, null, 2));

  console.log('\n--- Modifying ---');
  await prisma.$transaction(async (tx) => {
    await tx.checklist_Servicio_Detalle.deleteMany({ where: { ID_Checklist_Servicio: checklistId } });
    await tx.checklist_Servicio_Detalle.create({
      data: { ID_Checklist_Servicio: checklistId, ID_Material: 1, Cantidad_Requerida: 99 }
    });
  });

  console.log('\n--- Final Data ---');
  const c2 = await prisma.checklist_Servicio.findUnique({
    where: { ID_Checklist_Servicio: checklistId },
    include: { detalles: true }
  });
  console.log(JSON.stringify(c2.detalles, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
