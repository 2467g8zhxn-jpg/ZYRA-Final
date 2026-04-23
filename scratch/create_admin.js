const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🚀 Creating admin user...');
    
    // 1. Create or get Admin Employee
    const employee = await prisma.empleados.upsert({
      where: { ID_Empleado: 999 }, // Use a high ID to avoid conflicts if needed, or just search by email
      update: {},
      create: {
        ID_Empleado: 999,
        Nombre: 'Administrador ZYRA',
        Correo: 'admin@zyra.com',
        Telefono: '0000000000',
        ID_Empresa: 1
      }
    });

    // 2. Create Admin User
    const user = await prisma.usuarios.upsert({
      where: { Username: 'admin@zyra.com' },
      update: {
        Password_Hash: 'admin123',
        ID_Rol: 1
      },
      create: {
        Username: 'admin@zyra.com',
        Password_Hash: 'admin123',
        ID_Empleado: employee.ID_Empleado,
        ID_Rol: 1
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('User:', user.Username);
    console.log('Pass:', user.Password_Hash);
  } catch (e) {
    console.error('❌ Error creating admin:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
