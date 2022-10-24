import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
/* import postRouter from "./api/posts/index.js"; */
import userRouter from "./api/me/index.js"; 
import errorHandler from "./errorHandler.js";
import { join } from "path"
import mongoose from "mongoose";
const server = express();
const port = process.env.PORT || 3001
const publicFolderPath = join(process.cwd(), "./public");
/* const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL] */

server.use(express.static(publicFolderPath))
server.use(cors())
server.use(express.json())
/* server.use("/posts", postRouter) */
server.use("/users", userRouter)
server.use(errorHandler)

mongoose.connect(process.env.MONGO_CONNECTION_URL)

mongoose.connection.on("connected",()=>{
  server.listen( port, ()=>{
    console.log("server is connected to Database and is running on port:" , port)
    console.table(listEndpoints(server))
})})

server.on("error", (error)=>
console.log(`Server not running due to ${error}`)
)