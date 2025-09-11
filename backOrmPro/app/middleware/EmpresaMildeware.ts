import type { HttpContext } from '@adonisjs/core/http'
import TenantStorage from '#services/TenantStorage'


export default class empresaMiddleware{
 async handle({ request, response, auth }: HttpContext, next: () => Promise<void>) {
  // Intentar obtener empresaId del usuario autenticado
  let empresaId = auth?.user?.id_empresa
  if (!empresaId) {
    empresaId = Number(request.header('x-empresa-id'))
  }
  if (!empresaId) {
    return response.badRequest({ error: 'Empresa ID is required (header or user)' })
  }
  TenantStorage.run({ empresaId }, async () => {
    ;(request as any).empresaId = empresaId
    await next()
  })
}
}

