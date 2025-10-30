import Route from "@adonisjs/core/services/router";
import FaceController from "../../app/controller/FaceController.js";
import AuthJwtMiddleware from "#middleware/auth_jwt"

const faceController = new FaceController();
const authJwt = new AuthJwtMiddleware();

Route.group(() => {
  Route.post('/enroll', faceController.enroll);
  Route.post('/verify', faceController.verify);
  Route.post('/verifySelf', faceController.verifySelf);
}).prefix('/face')
.use(authJwt.handle.bind(authJwt));