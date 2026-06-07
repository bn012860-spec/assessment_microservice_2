import AuditLog from "../../models/AuditLog.mjs";

export async function logEvent({ event, userId, details, ip, userAgent }) {
  try {
    await AuditLog.create({
      event,
      userId,
      details,
      ip,
      userAgent
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

export async function listLogs(query = {}, limit = 100) {
  return AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email role');
}
