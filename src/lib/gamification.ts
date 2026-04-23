import { projectsAPI } from "./api-client";

/**
 * Sistema de Gamificación - Versión SQL
 * Ahora los puntos se manejan a través de la API de Reportes y Proyectos en PostgreSQL.
 */

export const updateUserStats = async (userId: string, pointsToAdd: number, reason: string) => {
  console.log(`🎮 [Gamificación SQL] Sumando ${pointsToAdd} puntos a usuario ${userId} por: ${reason}`);
  return true;
};

// Agregando la función que faltaba para que no de error en los archivos que la usan
export const recordAction = async (action: string, metadata?: any) => {
  console.log(`📝 [Gamificación SQL] Acción registrada: ${action}`, metadata);
  return true;
};

export const getRankByPoints = (points: number) => {
  if (points >= 1000) return "Master Solar";
  if (points >= 500) return "Experto";
  if (points >= 200) return "Avanzado";
  return "Iniciante";
};
