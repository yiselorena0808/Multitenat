import CargosController from '../../app/controller/CargoController.js'
import Route from '@adonisjs/core/services/router'
import AuthJwt from '../../app/middleware/auth_jwt.js'

const authJwt = new AuthJwt()
const cargosController = new CargosController()

Route.group(() => {
  // CRUD de cargos
  Route.post('/crear', cargosController.crear)
  Route.get('/listar', cargosController.listar)
  Route.put('/actualizar/:id_cargo', cargosController.actualizar)
  Route.delete('/eliminar/:id', cargosController.eliminar)

  // Productos por cargo
  Route.get('/:id_cargo/productos', cargosController.productosPorCargo)
  Route.get('/nombre/:nombre/productos', cargosController.productosPorCargoNombre)
})
  .prefix('/cargos')
  .use(authJwt.handle.bind(authJwt))
