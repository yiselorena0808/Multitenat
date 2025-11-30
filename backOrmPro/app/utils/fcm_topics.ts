export function topicForTenant(tenantId: number | string) {
  const prefix = process.env.FCM_TOPIC_PREFIX || 'prod'
  return `${prefix}_tenant_${tenantId}`
}

export function topicForTenantRole(tenantId: number, role: string) {
  // Ojo con espacios/mayúsculas, mejor algo simple
  return `tenant_${tenantId}_role_${role.toLowerCase()}`
}