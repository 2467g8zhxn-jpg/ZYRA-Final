
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const checklists = await prisma.checklist_Servicio.findMany({
    include: {
      detalles: {
        include: { material: true }
      }
    }
  });
  console.log(JSON.stringify(checklists, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
