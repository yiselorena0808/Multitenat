import CargoController from "../../app/controller/CargoController.js";
import Route from "@adonisjs/core/services/router";
import empresaMiddleware from "#middleware/EmpresaMildeware"
import AuthMiddleware from "#middleware/auth_middleware"

const cargo = new CargoController()
const auth = new AuthMiddleware()
const empresa = new empresaMiddleware()

Route.get('/listarCar', cargo.listarCargo).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.post('/crearCar', cargo.crearCargo).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.get('/listarCarId', cargo.listarCargoId).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.put('/actCar', cargo.actualizarCargo).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])
Route.delete('/eliminarCar', cargo.eliminarCargo).middleware([auth.handle.bind(auth), empresa.handle.bind(empresa)])

