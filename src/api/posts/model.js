import e from "cors";
import {Schema, model} from "mongoose";


const postDbSchema = new Schema(
    {
        text: {type: String, required: true},
        username: {type: String, required: true},
        image: {type: String, default:"https://cdn.pixabay.com/photo/2017/08/22/11/55/linked-in-2668688_960_720.png" },
        user: [{ type: Schema.Types.ObjectId, ref: "User" }],
        likes: [{ type: Schema.Types.ObjectId, ref: "User" }]

       
         
    },
    {timestamps: true}
  )
  
  export default model("Post",postDbSchema)