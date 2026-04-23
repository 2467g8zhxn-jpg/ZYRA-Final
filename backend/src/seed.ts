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
  console.log('👥 Seeding clients...');
  const clientsData = [
    {
      Nombre: 'Comex Railway',
      RazonSocial: 'Comex Railway S.A. de C.V.',
      Correo: 'comex@railway.com',
      Direccion: 'Av. Pintura 500',
      Telefono: '5551234567',
    },
    {
      Nombre: 'Walmart Postgre',
      RazonSocial: 'Walmart Postgre S.A. de C.V.',
      Correo: 'mantenimiento@walmart.com',
      Direccion: 'Supermercado 1',
      Telefono: '5559876543',
    }
  ];

  for (const client of clientsData) {
    const existing = await prisma.clientes.findFirst({ where: { Nombre: client.Nombre } });
    if (!existing) await prisma.clientes.create({ data: client });
  }

  // 4. Empleados & Usuarios
  console.log('👤 Seeding users...');
  const itzelEmail = 'itzel@zyra.com';
  let empleado1 = await prisma.empleados.findFirst({ where: { Correo: itzelEmail } });
  
  if (!empleado1) {
    empleado1 = await prisma.empleados.create({
      data: {
        Nombre: 'Itzel Admin',
        ID_Empresa: empresa.ID_Empresa,
        Correo: itzelEmail,
        Telefono: '1112223333',
      },
    });
  }

  const existingItzel = await prisma.usuarios.findFirst({ where: { Username: 'itzel' } });
  if (!existingItzel) {
    await prisma.usuarios.create({
      data: {
        Username: 'itzel',
        Password_Hash: 'password123',
        ID_Empleado: empleado1.ID_Empleado,
        ID_Rol: adminRol.ID_Rol,
      },
    });
  }

  // 4b. Servicios
  console.log('🛠️ Seeding services...');
  const installServ = await prisma.servicios.upsert({
    where: { ID_Servicio: 1 },
    update: {},
    create: { 
      ID_Servicio: 1,
      Tipo: 'Instalación', 
      Descripcion: 'Proyectos de obra nueva',
      ID_Empresa: empresa.ID_Empresa
    }
  });

  const maintServ = await prisma.servicios.upsert({
    where: { ID_Servicio: 2 },
    update: {},
    create: { 
      ID_Servicio: 2,
      Tipo: 'Mantenimiento', 
      Descripcion: 'Limpieza y revisión',
      ID_Empresa: empresa.ID_Empresa
    }
  });

  // 5. Materiales
  console.log('📦 Seeding materials...');
  // No borramos todo para evitar romper relaciones si ya hay datos
  const materiales = [
    { Nombre_Material: 'Paneles Solares 450W', Stock_Disponible: 150 },
    { Nombre_Material: 'Inversor Central 5kW', Stock_Disponible: 10 },
    { Nombre_Material: 'Microinversores IQ7+', Stock_Disponible: 40 }
  ];

  for (const mat of materiales) {
    const existing = await prisma.materiales.findFirst({ where: { Nombre_Material: mat.Nombre_Material } });
    if (!existing) await prisma.materiales.create({ data: mat });
  }
  
  console.log('📝 Seeding empty templates for manual setup...');
  const templates = [
    { Nombre: 'Plantilla Instalación', ID_Servicio: installServ.ID_Servicio },
    { Nombre: 'Plantilla Mantenimiento', ID_Servicio: maintServ.ID_Servicio }
  ];

  for (const template of templates) {
    const existing = await prisma.checklist_Servicio.findFirst({ where: { Nombre: template.Nombre } });
    if (!existing) await prisma.checklist_Servicio.create({ data: template });
  }

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
