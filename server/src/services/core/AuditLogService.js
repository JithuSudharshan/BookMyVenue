class AuditLogService {
  /**
   * Logs a lifecycle transition for auditing, debugging, and compliance.
   * In MVP, this logs to standard output. 
   * In V2, this will persist to a MongoDB `AuditLog` collection.
   *
   * @param {string} entity - The entity being modified (e.g., 'BOOKING')
   * @param {string} entityId - The ID of the entity
   * @param {string} action - The action performed (e.g., 'CANCELLED')
   * @param {string} actorRole - The role of the person performing the action (e.g., 'user', 'admin')
   * @param {Object} details - Additional metadata (e.g., reason, amounts)
   */
  logTransition(entity, entityId, action, actorRole, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      entity,
      entityId,
      action,
      actorRole,
      details,
    };
    
    // Output strictly formatted JSON for easier parsing by log aggregators (e.g., DataDog, CloudWatch)
    console.info(`[AUDIT] ${JSON.stringify(logEntry)}`);
  }
}

export default new AuditLogService();
