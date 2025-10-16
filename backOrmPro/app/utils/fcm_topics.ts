export function topicForTenant(tenantId: number | string) {
  const prefix = process.env.FCM_TOPIC_PREFIX || 'prod'
  return `${prefix}_tenant_${tenantId}`
}
