import type { HttpContext } from '@adonisjs/core/http'
import TenantStorage from '#services/TenantStorage'



export default class areaMiddleware{
 async handle({ request, response, auth }: HttpContext, next: () => Promise<void>) {
  // Intentar obtener areaId del usuario autenticado
  let tenantId = auth?.user?.id_area
  if (!tenantId) {
    tenantId = Number(request.header('x-area-id'))
  }
  if (!tenantId) {
    return response.badRequest({ error: 'Area ID is required (header or user)' })
  }
  try {
    TenantStorage.setTenantId(tenantId)
  } catch {
    return response.internalServerError({
      error: 'El tenant context no se inició (el tenant Empresa debe ejecutarse primero)',
    })
  }
  ;(request as any).tenantId = tenantId
  await next()
}
}