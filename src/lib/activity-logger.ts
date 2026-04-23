/**
 * Activity Logger - Versión SQL
 * Registra acciones importantes en el sistema.
 */

export const logActivity = async (data: {
  userId: string;
  type: string;
  title: string;
  description: string;
  metadata?: any;
}) => {
  console.log(`📝 [Bitácora SQL] Registro: ${data.title} - ${data.description}`);
  // Implementación futura: POST /api/activity-logs
  return true;
};
