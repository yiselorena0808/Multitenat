import ProductosController from "../../app/controller/ProductosController.js";
import router from "@adonisjs/core/services/router";
import AuthJwtMiddleware from "#middleware/auth_jwt"

const productosController = new ProductosController()
const authJwt = new AuthJwtMiddleware()

router.group(() => {
router.post('/crear', productosController.store)
router.get('/listar', productosController.index)
router.get('/listar/:id', productosController.show)
router.put('/actualizar/:id', productosController.update)
router.delete('/eliminar/:id', productosController.destroy)
router.get('/cargo/:id', productosController.listarPorCargo)
router.get('/cargo/nombre', productosController.listarPorCargoNombre)
})
    .prefix('/productos')
.use(authJwt.handle.bind(authJwt))