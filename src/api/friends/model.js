import { ObjectID } from "bson";
import e from "cors";
import {Schema, model} from "mongoose";
import { array } from "mongoose/lib/utils";


const userDbSchema = new Schema(
    {
    
    request: [],
    friends: []
         
    },
    {timestamps: true}
  )
  
  export default model("Post",userDbSchema)