import  {Router} from "express";
import { 
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    deleteUser } from "../controllers/user.controller.js";

import {verifyJWT} from "../middlewares/auth.middleware.js";

const routes=Router();


routes.route("/register").post(registerUser)
routes.route("/login").post(loginUser)


//secured routes

routes.route("/logout").post(verifyJWT,  logoutUser)
routes.route("/change-password").post(verifyJWT, changeCurrentPassword)
routes.route("/show-user-details").get(verifyJWT, getCurrentUser)
routes.route("/update-account-details").patch(verifyJWT, updateAccountDetails)
routes.route("/delete-user").delete(verifyJWT,deleteUser)
export  default routes;