import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";

dotenv.config()
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 5500,()=>{
        console.log(`server is running at port: ${process.env.PORT}`)
    })
    app.on("error",(error)=>{
        console.log("error",error)
        throw error;
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed!!!",err)
})


