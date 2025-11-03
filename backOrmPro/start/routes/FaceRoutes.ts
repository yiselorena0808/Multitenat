import Route from "@adonisjs/core/services/router";
import FaceController from "../../app/controller/FaceController.js";


const faceController = new FaceController();


Route.group(() => {
  Route.post('/enroll', faceController.enroll);
  Route.post('/verify', faceController.verify);
  Route.post('/verifySelf', faceController.verifySelf);
}).prefix('/face') 