import { projectsAPI, employeesAPI } from "./api-client";

/**
 * Sistema de Gamificación - Versión SQL
 * Ahora los puntos se manejan a través de la API de Reportes y Proyectos en PostgreSQL.
 */

export const updateUserStats = async (userId: string, pointsToAdd: number, reason: string, projectId?: number, reportId?: number) => {
  console.log(`🎮 [Gamificación SQL] Sumando ${pointsToAdd} puntos a usuario ${userId} por: ${reason}`);
  try {
     await employeesAPI.addPoints(userId, { 
       puntos: pointsToAdd, 
       motivo: reason,
       projectId: projectId,
       reportId: reportId
     });
     return true;
  } catch(e) {
     console.error("Error sumando puntos:", e);
     return false;
  }
};

// Agregando la función que faltaba para que no de error en los archivos que la usan
export const recordAction = async (userId: string | number, action: string, metadata?: any) => {
  console.log(`📝 [Gamificación SQL] Acción registrada: ${action}`, metadata);
  let points = 0;
  let reason = "Acción registrada";

  switch (action) {
    case "PROJECT_COMPLETED":
      points = 50;
      reason = "Proyecto Finalizado";
      break;
    case "REPORT_SENT":
      points = 50; // Recompensa directa por enviar el reporte
      reason = "Reporte de Avance Enviado";
      break;
    case "REPORT_APPROVED":
      points = 10;
      reason = "Reporte Aprobado por Admin";
      break;
    default:
      points = 5;
      reason = action;
  }

  return await updateUserStats(
    userId.toString(), 
    points, 
    reason, 
    metadata?.projectId, 
    metadata?.reportId
  );
};

export const getRankByPoints = (points: number) => {
  if (points >= 1000) return "Master Solar";
  if (points >= 500) return "Experto";
  if (points >= 200) return "Avanzado";
  return "Iniciante";
};

export const calcLevel = (points: number): number => {
  return Math.max(1, Math.floor(points / 200) + 1);
};
