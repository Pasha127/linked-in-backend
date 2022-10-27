import express from "express";
import { checkfriendSchema, checkValidationResult } from "./validator.js";
import multer from "multer";
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import friendModel from "./model.js";
import q2m from "query-to-mongo";

const localEndpoint = `${process.env.LOCAL_URL}${process.env.PORT}/users`;
/* const serverEndpoint= `${process.env.SERVER_URL}/users` */



const friendsRouter = express.Router();

friendsRouter.get("/", async (req, res, next) => {
  try {
    console.log(req.headers.origin, "GET friends at:", new Date());
    const mongoQuery = q2m.apply(req.query);
    const total = await friendModel.countDocuments(mongoQuery.criteria);
    const friends = await friendModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .sort(mongoQuery.options.sort)
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit);
    res.status(200).send({
      links: mongoQuery.links(localEndpoint, total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      friends,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
});

friendsRouter.get("/:friendId", async (req, res, next) => {
  try {
    const foundFriend = await friendModel.findById(req.params.friendId);
    if (foundFriend) {
      res.status(200).send(foundFriend);
    } else {
      next(createHttpError(404, "Friend Not Found"));
    }
  } catch (error) {
    next(error);
  }
});

friendsRouter.friend(
  "/",
  checkfriendSchema,
  checkValidationResult,
  async (req, res, next) => {
    try {
      console.log(req.headers.origin, "friend user at:", new Date());
      const newfriend = new friendModel(req.body);
      const { _id } = await newfriend.save();

      res.status(201).send({ message: `Added a new friend.`, _id });
    } catch (error) {
        console.log(error)
      next(error);
    }
  }
);


friendsRouter.put("/:friendId", async (req, res, next) => {
  try {
    const updatedfriend = await friendModel.findByIdAndUpdate(
      req.params.friendId,
      { ...req.body },
      { new: true, runValidators: true }
    );
    console.log(req.headers.origin, "PUT friend at:", new Date());

    res.status(200).send(updatedfriend);
  } catch (error) {
    next(error);
  }
});

friendsRouter.delete("/:friendId", async (req, res, next) => {
  try {
    console.log(req.headers.origin, "DELETE friend at:", new Date());
    const deletedfriend = await friendModel.findByIdAndDelete(req.params.friendId);
    if (deletedfriend) {
      res.status(204).send({ message: "friend has been deleted." });
    } else {
      next(createHttpError(404, "friend Not Found"));
    }
  } catch (error) {
    next(error);
  }
});

export default friendsRouter;
