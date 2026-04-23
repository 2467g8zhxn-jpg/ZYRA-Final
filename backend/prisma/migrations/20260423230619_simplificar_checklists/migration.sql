/*
  Warnings:

  - You are about to drop the column `Fecha_Creacion` on the `Checklist` table. All the data in the column will be lost.
  - You are about to drop the column `Fecha_Marcado` on the `Checklist_Detalle` table. All the data in the column will be lost.
  - You are about to drop the column `ID_Reporte` on the `Puntos_Historial` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[FirebaseUID]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Puntos_Historial" DROP CONSTRAINT "Puntos_Historial_ID_Reporte_fkey";

-- AlterTable
ALTER TABLE "Checklist" DROP COLUMN "Fecha_Creacion";

-- AlterTable
ALTER TABLE "Checklist_Detalle" DROP COLUMN "Fecha_Marcado";

-- AlterTable
ALTER TABLE "Equipos" ADD COLUMN     "Tipo" VARCHAR(50);

-- AlterTable
ALTER TABLE "Proyectos" ADD COLUMN     "Imagen_Url" TEXT,
ADD COLUMN     "Ubicacion" VARCHAR(255);

-- AlterTable
ALTER TABLE "Puntos_Historial" DROP COLUMN "ID_Reporte";

-- AlterTable
ALTER TABLE "Reportes" ADD COLUMN     "ID_Empleado" INTEGER;

-- AlterTable
ALTER TABLE "Usuarios" ADD COLUMN     "FirebaseUID" VARCHAR(128),
ALTER COLUMN "Password_Hash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_FirebaseUID_key" ON "Usuarios"("FirebaseUID");

-- AddForeignKey
ALTER TABLE "Reportes" ADD CONSTRAINT "Reportes_ID_Empleado_fkey" FOREIGN KEY ("ID_Empleado") REFERENCES "Empleados"("ID_Empleado") ON DELETE SET NULL ON UPDATE CASCADE;
