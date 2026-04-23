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
      Nombre: 'Zyra ',
      Direccion: 'Calle Principal 123',
      Correo: 'contacto@zyra.com',
      Telefono: '1234567890',
    },
  });

  // 3. Limpieza de usuarios viejos y creación de Admin
  console.log('👤 Cleaning up old users and creating admin@zyra.com...');
  
  // Borrar cualquier usuario que no sea el que queremos
  await prisma.usuarios.deleteMany({
    where: { Username: { not: 'admin@zyra.com' } }
  });

  const adminEmail = 'admin@zyra.com';
  let adminEmpleado = await prisma.empleados.findFirst({ where: { Correo: adminEmail } });
  
  if (!adminEmpleado) {
    adminEmpleado = await prisma.empleados.create({
      data: {
        Nombre: 'Admin',
        ID_Empresa: empresa.ID_Empresa,
        Correo: adminEmail,
        Telefono: '1112223333',
      },
    });
  }

  await prisma.usuarios.upsert({
    where: { Username: 'admin@zyra.com' },
    update: {
      Password_Hash: 'admin123',
      ID_Rol: adminRol.ID_Rol
    },
    create: {
      Username: 'admin@zyra.com',
      Password_Hash: 'admin123',
      ID_Empleado: adminEmpleado.ID_Empleado,
      ID_Rol: adminRol.ID_Rol,
    },
  });

  // 4. Servicios
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

  // 5. Plantillas por defecto
  console.log('📝 Seeding default templates...');
  const templates = [
    { Nombre: 'Plantilla: Instalación', ID_Servicio: installServ.ID_Servicio },
    { Nombre: 'Plantilla: Mantenimiento', ID_Servicio: maintServ.ID_Servicio }
  ];

  for (const template of templates) {
    const existing = await prisma.checklist_Servicio.findFirst({ 
      where: { 
        OR: [
          { Nombre: template.Nombre },
          { Nombre: template.Nombre.replace('Plantilla: ', 'Plantilla ') }
        ]
      } 
    });
    if (!existing) {
      await prisma.checklist_Servicio.create({ data: template });
    }
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
