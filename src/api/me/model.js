import {Schema, model} from "mongoose";


const userDbSchema = new Schema(
    {
      //Schema
    },
    {timestamps: true}
  )
  
  export default model("User",userDbSchema)