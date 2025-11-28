import Route from "@adonisjs/core/services/router";
import FaceAuthController from "../../app/controller/FaceAuthController.js";




const faceController = new FaceAuthController();


Route.group(() => {
  Route.post('/register', faceController.register)
}).prefix('/face') 
