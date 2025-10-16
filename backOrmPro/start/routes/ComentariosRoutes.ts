import router from '@adonisjs/core/services/router'
import ComentarioController from '../../app/controller/ComentariosController.js'
import AuthJwt from '../../app/middleware/auth_jwt.js'

const authJwt = new AuthJwt()
const ComentarioControllers = new ComentarioController()

router
  .group(() => {
    // Listar comentarios de una entidad
    router.get('/:tipoEntidad/:idEntidad/comentarios', ComentarioControllers.listar)

    // Crear un nuevo comentario
    router.post('/:tipoEntidad/:idEntidad/comentarios', ComentarioControllers.crear)

    // Editar un comentario
    router.put('/:tipoEntidad/:idEntidad/comentarios/:idComentario', ComentarioControllers.editar)

    // Eliminar un comentario
    router.delete('/:tipoEntidad/:idEntidad/comentarios/:idComentario', ComentarioControllers.eliminar)
  })
  .prefix('/comentarios')
    .use(authJwt.handle.bind(authJwt)) // ✅ Todas protegidas con autenticación