import e from "cors";
import {Schema, model} from "mongoose";


const userDbSchema = new Schema(
    {
        text: {type: String, required: true},
        username: {type: String, required: true},
        image: {type: String, required: true },
        user: {type: String, required: true},
      
       
         
    },
    {timestamps: true}
  )
  
  export default model("Post",userDbSchema)