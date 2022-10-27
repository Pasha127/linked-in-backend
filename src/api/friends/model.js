
import {Schema, model} from "mongoose";



const requestSchema = new Schema(
    {
      sender: {type: String, required: true},
      receiver: {type: String, required: true},
      status: {type: String , required: true,   enum: ["pending", "accepted", "denied"], default: "pending"}
    },         
    
    {timestamps: true}
  )
  
  export default model("request",requestSchema)