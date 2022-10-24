import e from "cors";
import {Schema, model} from "mongoose";


const userDbSchema = new Schema(
    {
        name: {type: String, required: true},
        surname: {type: String, required: true},
        email: {type: email, required: true},
        bio: {type: String, required: true},
        title: {type: String, required: true},
        area: {type: String, required: true},
         image: {type: String, required: true},
        username: {type: String, required: true}, 
    },
    {timestamps: true}
  )
  
  export default model("User",userDbSchema)