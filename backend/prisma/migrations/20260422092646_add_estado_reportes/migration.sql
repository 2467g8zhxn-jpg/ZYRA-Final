/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Material` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectMaterial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_teamId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMaterial" DROP CONSTRAINT "ProjectMaterial_materialId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMaterial" DROP CONSTRAINT "ProjectMaterial_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_projectId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_teamId_fkey";

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "Material";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "ProjectMaterial";

-- DropTable
DROP TABLE "ProjectMember";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "Team";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Roles" (
    "ID_Rol" SERIAL NOT NULL,
    "Nombre_Rol" VARCHAR(50) NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("ID_Rol")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "ID_Empresa" SERIAL NOT NULL,
    "Nombre" VARCHAR(100) NOT NULL,
    "Direccion" VARCHAR(255),
    "Correo" VARCHAR(100),
    "Telefono" VARCHAR(20),

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("ID_Empresa")
);

-- CreateTable
CREATE TABLE "Empleados" (
    "ID_Empleado" SERIAL NOT NULL,
    "ID_Empresa" INTEGER NOT NULL,
    "Nombre" VARCHAR(100) NOT NULL,
    "Telefono" VARCHAR(20),
    "Correo" VARCHAR(100),

    CONSTRAINT "Empleados_pkey" PRIMARY KEY ("ID_Empleado")
);

-- CreateTable
CREATE TABLE "Usuarios" (
    "ID_Usuario" SERIAL NOT NULL,
    "ID_Empleado" INTEGER,
    "ID_Rol" INTEGER,
    "Username" VARCHAR(50) NOT NULL,
    "Password_Hash" VARCHAR(255) NOT NULL,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("ID_Usuario")
);

-- CreateTable
CREATE TABLE "Equipos" (
    "ID_Equipo" SERIAL NOT NULL,
    "Nombre_Equipo" VARCHAR(100),

    CONSTRAINT "Equipos_pkey" PRIMARY KEY ("ID_Equipo")
);

-- CreateTable
CREATE TABLE "Empleado_Equipo" (
    "ID_Equipo" INTEGER NOT NULL,
    "ID_Empleado" INTEGER NOT NULL,
    "Cargo" VARCHAR(50),

    CONSTRAINT "Empleado_Equipo_pkey" PRIMARY KEY ("ID_Equipo","ID_Empleado")
);

-- CreateTable
CREATE TABLE "Clientes" (
    "ID_Cliente" SERIAL NOT NULL,
    "Nombre" VARCHAR(100) NOT NULL,
    "RazonSocial" VARCHAR(100),
    "Correo" VARCHAR(100),
    "Direccion" VARCHAR(255),
    "Telefono" VARCHAR(20),

    CONSTRAINT "Clientes_pkey" PRIMARY KEY ("ID_Cliente")
);

-- CreateTable
CREATE TABLE "Servicios" (
    "ID_Servicio" SERIAL NOT NULL,
    "ID_Empresa" INTEGER,
    "Tipo" VARCHAR(50),
    "Descripcion" VARCHAR(190),

    CONSTRAINT "Servicios_pkey" PRIMARY KEY ("ID_Servicio")
);

-- CreateTable
CREATE TABLE "Proyectos" (
    "ID_Proyecto" SERIAL NOT NULL,
    "ID_Cliente" INTEGER,
    "ID_Servicio" INTEGER,
    "ID_Equipo" INTEGER,
    "Nombre_Proyecto" VARCHAR(150) NOT NULL,
    "Fecha_Inicio" DATE,
    "Fecha_Fin" DATE,
    "Estado" VARCHAR(30),

    CONSTRAINT "Proyectos_pkey" PRIMARY KEY ("ID_Proyecto")
);

-- CreateTable
CREATE TABLE "Reportes" (
    "ID_Reporte" SERIAL NOT NULL,
    "ID_Proyecto" INTEGER,
    "ID_Equipo" INTEGER,
    "Comentarios" TEXT,
    "Evidencias_URL" TEXT,
    "Fecha_Reporte" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT DEFAULT 'Pendiente',

    CONSTRAINT "Reportes_pkey" PRIMARY KEY ("ID_Reporte")
);

-- CreateTable
CREATE TABLE "Materiales" (
    "ID_Material" SERIAL NOT NULL,
    "Nombre_Material" VARCHAR(100),
    "Stock_Disponible" INTEGER,

    CONSTRAINT "Materiales_pkey" PRIMARY KEY ("ID_Material")
);

-- CreateTable
CREATE TABLE "Checklist_Servicio" (
    "ID_Checklist_Servicio" SERIAL NOT NULL,
    "ID_Servicio" INTEGER,
    "Nombre" VARCHAR(100),

    CONSTRAINT "Checklist_Servicio_pkey" PRIMARY KEY ("ID_Checklist_Servicio")
);

-- CreateTable
CREATE TABLE "Checklist_Servicio_Detalle" (
    "ID_Checklist_Servicio_Detalle" SERIAL NOT NULL,
    "ID_Checklist_Servicio" INTEGER,
    "ID_Material" INTEGER,
    "Cantidad_Requerida" INTEGER,

    CONSTRAINT "Checklist_Servicio_Detalle_pkey" PRIMARY KEY ("ID_Checklist_Servicio_Detalle")
);

-- CreateTable
CREATE TABLE "Checklist" (
    "ID_Checklist" SERIAL NOT NULL,
    "ID_Proyecto" INTEGER,
    "Fecha_Creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Estado" VARCHAR(30),

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("ID_Checklist")
);

-- CreateTable
CREATE TABLE "Checklist_Detalle" (
    "ID_Checklist_Detalle" SERIAL NOT NULL,
    "ID_Checklist" INTEGER,
    "ID_Checklist_Servicio_Detalle" INTEGER,
    "ID_Material" INTEGER,
    "Cantidad_Requerida" INTEGER,
    "Cantidad_Cargada" INTEGER,
    "Marcado" BOOLEAN NOT NULL DEFAULT false,
    "Fecha_Marcado" TIMESTAMP(3),
    "ID_Empleado" INTEGER,
    "Observaciones" TEXT,

    CONSTRAINT "Checklist_Detalle_pkey" PRIMARY KEY ("ID_Checklist_Detalle")
);

-- CreateTable
CREATE TABLE "Puntos_Historial" (
    "ID_Punto" SERIAL NOT NULL,
    "ID_Empleado" INTEGER,
    "ID_Proyecto" INTEGER,
    "ID_Reporte" INTEGER,
    "Cantidad_Puntos" INTEGER,
    "Fecha_Asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Motivo" TEXT,

    CONSTRAINT "Puntos_Historial_pkey" PRIMARY KEY ("ID_Punto")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_ID_Empleado_key" ON "Usuarios"("ID_Empleado");

-- AddForeignKey
ALTER TABLE "Empleados" ADD CONSTRAINT "Empleados_ID_Empresa_fkey" FOREIGN KEY ("ID_Empresa") REFERENCES "Empresa"("ID_Empresa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_ID_Empleado_fkey" FOREIGN KEY ("ID_Empleado") REFERENCES "Empleados"("ID_Empleado") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_ID_Rol_fkey" FOREIGN KEY ("ID_Rol") REFERENCES "Roles"("ID_Rol") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado_Equipo" ADD CONSTRAINT "Empleado_Equipo_ID_Equipo_fkey" FOREIGN KEY ("ID_Equipo") REFERENCES "Equipos"("ID_Equipo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado_Equipo" ADD CONSTRAINT "Empleado_Equipo_ID_Empleado_fkey" FOREIGN KEY ("ID_Empleado") REFERENCES "Empleados"("ID_Empleado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicios" ADD CONSTRAINT "Servicios_ID_Empresa_fkey" FOREIGN KEY ("ID_Empresa") REFERENCES "Empresa"("ID_Empresa") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proyectos" ADD CONSTRAINT "Proyectos_ID_Cliente_fkey" FOREIGN KEY ("ID_Cliente") REFERENCES "Clientes"("ID_Cliente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proyectos" ADD CONSTRAINT "Proyectos_ID_Servicio_fkey" FOREIGN KEY ("ID_Servicio") REFERENCES "Servicios"("ID_Servicio") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proyectos" ADD CONSTRAINT "Proyectos_ID_Equipo_fkey" FOREIGN KEY ("ID_Equipo") REFERENCES "Equipos"("ID_Equipo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reportes" ADD CONSTRAINT "Reportes_ID_Proyecto_fkey" FOREIGN KEY ("ID_Proyecto") REFERENCES "Proyectos"("ID_Proyecto") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reportes" ADD CONSTRAINT "Reportes_ID_Equipo_fkey" FOREIGN KEY ("ID_Equipo") REFERENCES "Equipos"("ID_Equipo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist_Servicio" ADD CONSTRAINT "Checklist_Servicio_ID_Servicio_fkey" FOREIGN KEY ("ID_Servicio") REFERENCES "Servicios"("ID_Servicio") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist_Servicio_Detalle" ADD CONSTRAINT "Checklist_Servicio_Detalle_ID_Checklist_Servicio_fkey" FOREIGN KEY ("ID_Checklist_Servicio") REFERENCES "Checklist_Servicio"("ID_Checklist_Servicio") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist_Servicio_Detalle" ADD CONSTRAINT "Checklist_Servicio_Detalle_ID_Material_fkey" FOREIGN KEY ("ID_Material") REFERENCES "Materiales"("ID_Material") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_ID_Proyecto_fkey" FOREIGN KEY ("ID_Proyecto") REFERENCES "Proyectos"("ID_Proyecto") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist_Detalle" ADD CONSTRAINT "Checklist_Detalle_ID_Checklist_fkey" FOREIGN KEY ("ID_Checklist") REFERENCES "Checklist"("ID_Checklist") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist_Detalle" ADD CONSTRAINT "Checklist_Detalle_ID_Checklist_Servicio_Detalle_fkey" FOREIGN KEY ("ID_Checklist_Servicio_Detalle") REFERENCES "Checklist_Servicio_Detalle"("ID_Checklist_Servicio_Detalle") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist_Detalle" ADD CONSTRAINT "Checklist_Detalle_ID_Material_fkey" FOREIGN KEY ("ID_Material") REFERENCES "Materiales"("ID_Material") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist_Detalle" ADD CONSTRAINT "Checklist_Detalle_ID_Empleado_fkey" FOREIGN KEY ("ID_Empleado") REFERENCES "Empleados"("ID_Empleado") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Puntos_Historial" ADD CONSTRAINT "Puntos_Historial_ID_Empleado_fkey" FOREIGN KEY ("ID_Empleado") REFERENCES "Empleados"("ID_Empleado") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Puntos_Historial" ADD CONSTRAINT "Puntos_Historial_ID_Proyecto_fkey" FOREIGN KEY ("ID_Proyecto") REFERENCES "Proyectos"("ID_Proyecto") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Puntos_Historial" ADD CONSTRAINT "Puntos_Historial_ID_Reporte_fkey" FOREIGN KEY ("ID_Reporte") REFERENCES "Reportes"("ID_Reporte") ON DELETE SET NULL ON UPDATE CASCADE;
