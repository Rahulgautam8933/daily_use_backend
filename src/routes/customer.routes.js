import  {Router} from "express";
import { addCustomer,  getAllCustomers, getCustomer, updateCustomerData } from "../controllers/customer.controller.js";


const routes=Router();
routes.route("/addCustomer").post(addCustomer)
routes.route("/getAllCustomers").get(getAllCustomers)
routes.route("/customers/:id").get(getCustomer)
routes.route("/customers/:id").put(updateCustomerData)

export  default routes;