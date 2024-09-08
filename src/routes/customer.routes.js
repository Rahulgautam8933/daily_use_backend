import  {Router} from "express";
import { addCustomer, 
     deleteCustomerDataItem,
    updateCustomer,
    deleteCustomer, 
     getAllCustomers,
     getCustomer,
     updateCustomerData,
     updateCustomerDataItem } from "../controllers/customer.controller.js";


const routes=Router();
routes.route("/addCustomer").post(addCustomer)
routes.route("/getAllCustomers").get(getAllCustomers)
routes.route("/customers/:id").get(getCustomer)
routes.route("/customers/:id").patch(updateCustomer)
routes.route("/customers/:id").delete(deleteCustomer)



routes.route("/customers/:id").post(updateCustomerData)
routes.route("/customers/:customerId/data/:dataId").put(updateCustomerDataItem)
routes.route("/customers/:customerId/data/:dataId").delete(deleteCustomerDataItem)

export  default routes;