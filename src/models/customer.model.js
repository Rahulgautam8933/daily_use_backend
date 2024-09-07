import mongoose, {Schema} from "mongoose";

const customerSchema=new Schema(
    
        {
            fullname: {
                type: String,
                required: true,
                lowercase: true,
                trim: true, 
                index: true
            },
            mobile: {
                type:Number,
                required: true,
                unique: true, 
                index:true
            },
            address: {
                type: String,
                required: true,
                trim: true, 
                index: true
            },
            days:{
                type:Number,
                required: true,
                index:true
            },
            quantity:{
                type:Number,
                required: true,
                index:true
            }
    },
    {
        timestamps:true
    }
)
export const Customer=mongoose.model("Customer",customerSchema)