import express from "express";
import { checkUserSchema, checkValidationResult } from "./validator.js";
import multer from "multer";
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import userModel from "./model.js";
import q2m from "query-to-mongo";
import json2csv from "json2csv";
import { pipeline, Readable, Stream } from "stream";


import mongo from "mongodb";
import { getPDFReadableStream } from "./tools.js";

/* const localEndpoint = `${process.env.LOCAL_URL}${process.env.PORT}/users`; */
 const serverEndpoint= `${process.env.SERVER_URL}/users`

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "Users" },
  }),
  limits: { fileSize: 1024 * 1024 },
}).single("image");

const userRouter = express.Router();

userRouter.get("/:userId/CSV", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=user.csv");

    const user = await userModel.findById(req.params.userId);
    const source = new Readable({
      read(size) {
        this.push(JSON.stringify(user.experiences));
        this.push(null)
      },
    });
   
    const destination = res;
    const transform = new json2csv.Transform();

   if(user.experiences.length !== 0){
    pipeline(source, transform, destination, (err) => {
      
      if (err) console.log(err);
    });
   }else{
    next("Experiences should not be empty")
   }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
userRouter.get("/:userId/pdf", async (req, res, next) => {
  try {
    // SOURCE (PDF Readable Stream) --> DESTINATION (http response)

    res.setHeader("Content-Disposition", "attachment; filename=user.pdf")
    let user = await userModel.findById(req.params.userId)
    const source = getPDFReadableStream(user)
   
    const destination = res

    pipeline(source, destination, err => {
      if (err) console.log(err)
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
})

userRouter.get("/", async (req, res, next) => {
  try {
    console.log(req.headers.origin, "GET users at:", new Date());
    const mongoQuery = q2m.apply(req.query);
    const total = await userModel.countDocuments(mongoQuery.criteria);
    const users = await userModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .sort(mongoQuery.options.sort)
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit);
    res.status(200).send({
      links: mongoQuery.links(serverEndpoint, total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      users,
    });
  } catch (error) {
   
    next(error);
  }
});

userRouter.get("/me", async (req, res, next) => {
  try {
    console.log(req.headers.authorization, `GET user: ${req.headers} at:`, new Date());
    const username= req.headers.authorization;
    const foundUser = await userModel.findOne({username: username});
    console.log(foundUser, "foundUser");
    if (foundUser) {
      res.status(200).send(foundUser);
    } else {
      next(createHttpError(404, "User Not Found"));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

userRouter.get("/me", async (req, res, next) => {
  try {
    console.log(req.headers.authorization, `GET user: ${req.headers} at:`, new Date());
    const username= req.headers.authorization;
    const foundUser = await userModel.findOne({username: username});
    console.log(foundUser, "foundUser");
    if (foundUser) {
      res.status(200).send(foundUser);
    } else {
      next(createHttpError(404, "User Not Found"));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

userRouter.get("/:userId", async (req, res, next) => {
  try {
    console.log(req.headers.origin, "GET user at:", new Date());
    const foundUser = await userModel.findById(req.params.userId);
    if (foundUser) {
      res.status(200).send(foundUser);
    } else {
      next(createHttpError(404, "User Not Found"));
    }
  } catch (error) {
    console.log("soooso", error)
    next(error);
  }
});

userRouter.post("/",
  checkUserSchema,
  checkValidationResult,
  async (req, res, next) => {
    try {      
      if( await userModel.findOne({username:req.body.username})){
        next(createHttpError(400, "Username Already In Use"));
      }else{
      console.log(req.headers.origin, "POST user at:", new Date());
      const newUser = new userModel(req.body);
      const { _id } = await newUser.save();
      res.status(201).send({ message: `Added a new user.`, _id });
    }} catch (error) { 
      next(error);
    }
  }
);
userRouter.put(
  "/images/:userId/pic",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      console.log("Tried to put a pic.", req.file.path);
      const foundUser = await userModel.findByIdAndUpdate(
        req.params.userId,
        { image: req.file.path },
        { new: true, runValidators: true }
      );

      res.status(201).send({ message: "User Pic Uploaded" });
    } catch (error) {
      console.log(error)
      next(error);
    }
  }
);

userRouter.put("/:userId", async (req, res, next) => {
  try {
    const foundUser = await userModel.findByIdAndUpdate(
      req.params.userId,
      { ...req.body },
      { new: true, runValidators: true }
    );
    console.log(req.headers.origin, "PUT user at:", new Date());

    res.status(200).send(foundUser);
  } catch (error) {
    next(error);
  }
});
userRouter.post("/experience/:userId", async (req, res, next) => {
  try {
    const foundUser = await userModel.findById(
      req.params.userId);
      foundUser.experiences.push({...req.body});
      foundUser.save()
    console.log(req.headers.origin, "POST experience at:", new Date());
    res.status(200).send(foundUser);
  } catch (error) {
    console.log(error)
    next(error);
  }
});

userRouter.delete("/:userId", async (req, res, next) => {
  try {
    console.log(req.headers.origin, "DELETE user at:", new Date());
    const deletedUser = await userModel.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.status(204).send({ message: "user has been deleted." });
    } else {
      next(createHttpError(404, "user Not Found"));
    }
  } catch (error) {
    next(error);
  }
});


export default userRouter;
