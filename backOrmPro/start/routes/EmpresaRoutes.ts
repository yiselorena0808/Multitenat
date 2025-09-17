import EmpresaController from '../../app/controller/EmpresaController.js'
import Route from "@adonisjs/core/services/router"


const empresaController = new EmpresaController()


Route.post('/crearEmpresa', empresaController.crearEmpresa)
Route.get('/listarEmpresas', empresaController.listarEmpresas)
Route.get('/idEmpresa/:id', empresaController.listarEmpresaId)
Route.delete('/eliminarEmpresa/:id', empresaController.eliminarEmpresa)
Route.put('/actualizarEmpresa/:id', empresaController.actualizarEmpresa)
Route.get('/conteoEmpresas', empresaController.conteoEmpresas)