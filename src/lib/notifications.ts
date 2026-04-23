/**
 * Sistema de Notificaciones - Versión SQL
 * Ahora las notificaciones se consultan desde el Backend SQL.
 */

export const sendNotification = async (userId: string, title: string, message: string) => {
  console.log(`🔔 [Notificación SQL] Para ${userId}: ${title} - ${message}`);
  // Implementación futura: POST /api/notifications
  return true;
};

export const markAsRead = async (notificationId: string) => {
  console.log(`✅ [Notificación SQL] Marcada como leída: ${notificationId}`);
  return true;
};
