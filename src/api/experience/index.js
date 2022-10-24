import express from "express";
import { checkUserSchema, checkValidationResult } from "./validator.js"
import multer from "multer"; 
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import userModel from "./model.js";
import q2m from "query-to-mongo";

const localEndpoint=`${process.env.LOCAL_URL}${process.env.PORT}/users`
/* const serverEndpoint= `${process.env.SERVER_URL}/users` */


const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
      cloudinary, 
      params: {folder: "Users"},
    }),
    limits: { fileSize: 1024 * 1024 },
  }).single("image")

const userRouter = express.Router();

userRouter.get("/", async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "GET users at:", new Date());
        const mongoQuery = q2m.apply(req.query);
        const total = await userModel.countDocuments(mongoQuery.criteria);
        const users = await userModel.find(
          mongoQuery.criteria,
          mongoQuery.options.fields
        )
        .sort(mongoQuery.options.sort)
        .skip(mongoQuery.options.skip)
        .limit(mongoQuery.options.limit)
        res.status(200).send({
          links:mongoQuery.links(localEndpoint,total),
          total,
          totalPages: Math.ceil(total/mongoQuery.options.limit), 
          users
        })        
    }catch(error){ 
        next(error)
    }    
})


userRouter.get("/:userId" , async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "GET user at:", new Date());       
        const foundUser = await userModel.findById(req.params.userId)       
        if(foundUser){
            res.status(200).send(foundUser);
        }else{next(createHttpError(404, "User Not Found"));
    } 
    }catch(error){
        next(error);
    }
})


userRouter.post("/", checkUserSchema, checkValidationResult, async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "POST user at:", new Date());
        const newUser = new userModel(req.body);
        const{_id}= await newUser.save();

        res.status(201).send({message:`Added a new user.`,_id});
        
    }catch(error){
        next(error);
    }
})






userRouter.put("/images/:userId/pic",cloudinaryUploader, async (req,res,next)=>{try{     
    console.log("Tried to put a pic.", req.file.path);
    const foundUser = await userModel.findByIdAndUpdate(req.params.userId,
        {imageUrl:req.file.path},
        {new:true,runValidators:true});
        
        res.status(201).send({message: "User Pic Uploaded"});
    }catch(error){ next(error) }});
    

    
    
    
    userRouter.put("/:userId", async (req,res,next)=>{
        try{ const foundUser = await userModel.findByIdAndUpdate(req.params.userId,
            {...req.body},
            {new:true,runValidators:true});
            console.log(req.headers.origin, "PUT user at:", new Date());
            
            res.status(200).send(updatedUser);
            
        }catch(error){ 
            next(error);
        }
    })
    
    
    userRouter.delete("/:userId", async (req,res,next)=>{try{
        console.log(req.headers.origin, "DELETE user at:", new Date());
        const deletedUser =  await userModel.findByIdAndDelete(req.params.userId)      
        if(deletedUser){
            res.status(204).send({message:"user has been deleted."})
        }else{
            next(createHttpError(404, "user Not Found"));    
        }
    }catch(error){
        next(error)
    }
})


export default productRouter;