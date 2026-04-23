import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

// Actualizar los proyectos existentes con sus ubicaciones
await p.proyectos.update({
  where: { ID_Proyecto: 2 },
  data: { Ubicacion: 'Michoacana Norte, Morelia, Michoacán' }
});
console.log('✅ Michoacana Norte actualizado');

await p.proyectos.update({
  where: { ID_Proyecto: 3 },
  data: { Ubicacion: 'Soriana, Dirección del Cliente' }
});
console.log('✅ Soles actualizado');

await p.$disconnect();
console.log('Listo!');
