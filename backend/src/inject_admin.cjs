const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  console.log('🚀 Creando usuario administrador oficial...');
  
  try {
    // 1. Asegurar que el Rol Admin exista (ID 1)
    const adminRol = await prisma.roles.upsert({
      where: { ID_Rol: 1 },
      update: {},
      create: { ID_Rol: 1, Nombre_Rol: 'admin' }
    });

    // 2. Crear el Empleado Admin
    const empleado = await prisma.empleados.create({
      data: {
        Nombre: 'Administrador ZYRA',
        ID_Empresa: 1, // Asumiendo que la empresa 1 ya existe por el seed anterior
        Correo: 'admin@zyra.com',
        Telefono: '0000000000'
      }
    });

    // 3. Crear el Usuario de Acceso
    const usuario = await prisma.usuarios.create({
      data: {
        Username: 'admin@zyra.com',
        Password_Hash: 'admin123', // En producción esto debería estar hasheado, pero lo mantendremos así para tu prueba rápida
        ID_Empleado: empleado.ID_Empleado,
        ID_Rol: adminRol.ID_Rol
      }
    });

    console.log('✅ Usuario Creado Exitosamente:');
    console.log('📧 Email/User: admin@zyra.com');
    console.log('🔑 Pass: admin123');

  } catch (error) {
    console.error('❌ Error al crear admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
