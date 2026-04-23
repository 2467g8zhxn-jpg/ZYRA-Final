import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Roles
  const adminRol = await prisma.roles.upsert({
    where: { ID_Rol: 1 },
    update: {},
    create: {
      ID_Rol: 1,
      Nombre_Rol: 'admin',
    },
  });

  const techRol = await prisma.roles.upsert({
    where: { ID_Rol: 2 },
    update: {},
    create: {
      ID_Rol: 2,
      Nombre_Rol: 'técnico',
    },
  });

  // 2. Empresa
  const empresa = await prisma.empresa.upsert({
    where: { ID_Empresa: 1 },
    update: {},
    create: {
      ID_Empresa: 1,
      Nombre: 'Zyra Soluciones',
      Direccion: 'Calle Principal 123',
      Correo: 'contacto@zyra.com',
      Telefono: '1234567890',
    },
  });

  // 3. Clientes
  const client1 = await prisma.clientes.create({
    data: {
      Nombre: 'Comex Railway',
      RazonSocial: 'Comex Railway S.A. de C.V.',
      Correo: 'comex@railway.com',
      Direccion: 'Av. Pintura 500',
      Telefono: '5551234567',
    },
  });

  const client2 = await prisma.clientes.create({
    data: {
      Nombre: 'Walmart Postgre',
      RazonSocial: 'Walmart Postgre S.A. de C.V.',
      Correo: 'mantenimiento@walmart.com',
      Direccion: 'Supermercado 1',
      Telefono: '5559876543',
    },
  });

  // 4. Empleados & Usuarios
  const empleado1 = await prisma.empleados.create({
    data: {
      Nombre: 'Itzel Admin',
      ID_Empresa: empresa.ID_Empresa,
      Correo: 'itzel@zyra.com',
      Telefono: '1112223333',
    },
  });

  const user1 = await prisma.usuarios.create({
    data: {
      Username: 'itzel',
      Password_Hash: 'password123',
      ID_Empleado: empleado1.ID_Empleado,
      ID_Rol: adminRol.ID_Rol,
    },
  });

  // 4b. Servicios
  const installServ = await prisma.servicios.create({ 
    data: { Tipo: 'Instalación', Descripcion: 'Proyectos de obra nueva' } 
  });
  const maintServ = await prisma.servicios.create({ 
    data: { Tipo: 'Mantenimiento', Descripcion: 'Limpieza y revisión' } 
  });

  // 5. Materiales
  console.log('📦 Seeding materials...');
  await prisma.checklist_Servicio_Detalle.deleteMany();
  await prisma.checklist_Servicio.deleteMany();
  await prisma.materiales.deleteMany();

  const mat1 = await prisma.materiales.create({ data: { Nombre_Material: 'Paneles Solares 450W', Stock_Disponible: 150 } });
  const mat2 = await prisma.materiales.create({ data: { Nombre_Material: 'Inversor Central 5kW', Stock_Disponible: 10 } });
  const mat3 = await prisma.materiales.create({ data: { Nombre_Material: 'Microinversores IQ7+', Stock_Disponible: 40 } });
  
  console.log('📝 Seeding empty templates for manual setup...');
  await prisma.checklist_Servicio.create({
    data: {
      Nombre: 'Plantilla Instalación',
      ID_Servicio: installServ.ID_Servicio
    }
  });

  await prisma.checklist_Servicio.create({
    data: {
      Nombre: 'Plantilla Mantenimiento',
      ID_Servicio: maintServ.ID_Servicio
    }
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
