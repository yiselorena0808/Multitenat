import Route from "@adonisjs/core/services/router";
import FaceAuthController from "../../app/controller/FaceAuthController.js";
import AuthJwt from '../../app/middleware/auth_jwt.js'


const authJwt = new AuthJwt();
const faceController = new FaceAuthController();


Route.group(() => {
  Route.post('/register', faceController.register).use(authJwt.handle.bind(authJwt))
  Route.post('/login', faceController.login)
}).prefix('/face') 
