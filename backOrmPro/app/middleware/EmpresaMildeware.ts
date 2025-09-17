import type { HttpContext } from '@adonisjs/core/http'

export default class EmpresaMiddleware {
  public async handle({ request, response }: HttpContext, next: () => Promise<void>) {
    if (request.url().startsWith('/empresas')) {
      await next()
      return
    }

    const user = (request as any).user

    if (!user || !user.idEmpresa) {
      return response.unauthorized({ error: 'El usuario no tiene empresa asociada' })
    }
    ;(request as any).empresaId = user.idEmpresa

    await next()
  }
}
