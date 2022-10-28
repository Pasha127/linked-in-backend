import express from "express";
import { checkPostSchema, checkValidationResult } from "./validator.js";
import multer from "multer";
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import postModel from "./model.js";
import q2m from "query-to-mongo";
import userModel from "../me/model.js";

/* const localEndpoint = `${process.env.LOCAL_URL}${process.env.PORT}/users`; */
const serverEndpoint= `${process.env.SERVER_URL}/posts` 

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "Posts" },
  }),
  limits: { fileSize: 1024 * 1024 },
}).single("image");

const postsRouter = express.Router();

postsRouter.get("/", async (req, res, next) => {
  try {
    console.log(req.headers.origin, "GET posts at:", new Date());
    const mongoQuery = q2m.apply(req.query);
    const total = await postModel.countDocuments(mongoQuery.criteria);
    const posts = await postModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .sort(mongoQuery.options.sort)
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit)      
      .populate({
        path: "user",
        select: "name surname username image"
      })
    res.status(200).send({
      links: mongoQuery.links(serverEndpoint, total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      posts,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
});

postsRouter.get("/:postId", async (req, res, next) => {
  try {
    console.log(req.headers.origin, "GET user at:", new Date());
    const foundPost = await postModel.findById(req.params.postId);
    if (foundPost) {
      res.status(200).send(foundPost);
    } else {
      next(createHttpError(404, "Post Not Found"));
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.post(
  "/",
  checkPostSchema,
  checkValidationResult,
  async (req, res, next) => {
    try {
      console.log(req.headers.origin, "POST user at:", new Date());
      const newPost = new postModel(req.body)
      const { _id } = await newPost.save();

      res.status(201).send({ message: `Added a new Post.`, _id });
    } catch (error) {
        console.log(error)
      next(error);
    }
  }
);



postsRouter.put(
  "/images/:postId",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      console.log("Tried to put a pic.", req.file.path);
      const foundPost = await postModel.findByIdAndUpdate(
        req.params.postId,
        { image: req.file.path },
        { new: true, runValidators: true }
      );

      res.status(201).send({ message: "Post Pic Uploaded" });
    } catch (error) {
    console.log(error)
      next(error);
    }
  }
);

postsRouter.put("/:postId", async (req, res, next) => {
  try {
    console.log(req);
    const updatedPost = await postModel.findByIdAndUpdate(
      req.params.postId,
      { ...req.body },
      { new: true, runValidators: true }
    );
 

    res.status(200).send(updatedPost);
  } catch (error) {
    next(error);
  }
});

postsRouter.delete("/:postId", async (req, res, next) => {
  try {
    console.log(req.headers.origin, "DELETE post at:", new Date());
    const deletedPost = await postModel.findByIdAndDelete(req.params.postId);
    if (deletedPost) {
      res.status(204).send({ message: "Post has been deleted." });
    } else {
      next(createHttpError(404, "Post Not Found"));
    }
  } catch (error) {
    next(error);
  }
});

postsRouter.get("/:postId/likes", async (req, res, next) => {
  try {
    const post = await postModel.findById(req.params.postId)
    if(post){
      const likes = post.likes
      res.status(200).send(likes)
    }else{
      next(createHttpError(404, "post not found"))
    }
   
  } catch (error) {
    next(error)
  }
})

postsRouter.put("/:postId/likes/:userId", async (req, res, next) => {
  try {
    const post = await postModel.findById(req.params.postId)
    if(post){
      if(post.likes.includes(req.params.userId)){
        const postLikesArray = post

        const index = postLikesArray.likes.indexOf(req.params.userId)
        postLikesArray.likes.splice(index, 1)
        await postLikesArray.save()
          res.status(200).send( {message: "like removed"})
      }else{
        const user = await userModel.findById(req.params.userId)
        const { _id } = await user.save();
        const updatedPost = await postModel.findByIdAndUpdate(post._id)
        updatedPost.likes.length > 0 ? updatedPost.likes = [...updatedPost.likes, _id] : updatedPost.likes = [_id]
        await updatedPost.save()
        res.status(200).send( {message: "like added", _id})
      }
   
    }else{
      next(createHttpError(404, "post not found"))
    }

  } catch (error) {
    console.log(error)
    next(error)
  }
})



export default postsRouter;
