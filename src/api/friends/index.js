import express from "express";
import createHttpError from "http-errors";
import requestModel from "./model.js";
import userModel from "../me/model.js";

const localEndpoint = `${process.env.LOCAL_URL}${process.env.PORT}/requests`;


const requestRouter = express.Router();

requestRouter.post("/", async (req, res, next) => {
  try {
    const newRequest = requestModel(req.body);
    const sender = await userModel.findById(newRequest.sender)
    const receiver = await userModel.findById(newRequest.receiver)
    if(sender.friends.includes(receiver._id)){
      res.send({message: "the users are already friends"})
    }else if (receiver.friends.includes(sender._id)){
      res.send({message: "the users are already friends"})
    }
    const { _id } = await newRequest.save();

    res.status(201).send({ message: `Added a new request.`, _id });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

requestRouter.put("/:requestId/accepted" , async (req, res, next) => {
try {
  const request = await requestModel.findById(req.params.requestId)
  console.log(request)
  if(request){
    const sender = request.sender;
    const receiver = request.receiver;
     await requestModel.findByIdAndUpdate(req.params.requestId, {status: "accepted"})
     const senderDoc = await userModel.findById(sender)
     const receiverDoc = await userModel.findById(receiver)
     console.log(senderDoc)
     console.log(receiverDoc)
     
     senderDoc.friends.length > 0 ? senderDoc.friends  = [...senderDoc.friends, receiver] : senderDoc.friends = [receiver]
     await senderDoc.save()

     receiverDoc.friends.length > 0 ? receiverDoc.friends = [...receiverDoc.friends, sender] : receiverDoc.friends = [sender]
     await receiverDoc.save()
      await requestModel.findByIdAndDelete(req.params.requestId)
      res.status(201).send({message: "user has accepted the request"})
  }else{
    next(createHttpError(404, "request Not Found"));
  }
  
} catch (error) {
  console.log(error)
  next(error)
}

})
requestRouter.put("/:requestId/denied" , async (req, res, next) => {
  try {
    const request = await requestModel.findById(req.params.requestId)
    if(request){
      const sender = request.sender;
      const receiver = request.receiver;
      await  requestModel.findByIdAndUpdate(req.params.requestId, {status: "denied"})
      await requestModel.findOneAndDelete({ _id: req.params.requestId });
      res.status(204).send({ message: "request has been deleted." });
        res.status(201).send({message: "user has denied the request"})
    }else{
      next(createHttpError(404, "request Not Found"));
    }
    
  } catch (error) {
    next(error)
  }
  
  })

// requestRouter.put("/:requestId", async (req, res, next) => {
//   try {
//     const request = await requestModel.findById(req.params.requestId);
//     if(request){
//       const userAnswer = request.status;
//       const sender = request.sender;
//       const receiver = request.receiver;
//     }else{
//       next(createHttpError(404, "request not found"))
//     }
//     if (userAnswer === "accepted") {

//     //  await userModel.findByIdAndUpdate(sender, { friends: [...sender.friends, receiver] });
//     //   await userModel.findByIdAndUpdate(receiver, { friends: [...receiver.friends, sender] });
//       res.status(201).send({ message: "users are now friends." });
//     } else if (userAnswer === "denied") {

//     }
//   } catch (error) {
//     console.log(error)
//     next(error);
//   }
// });

export default requestRouter;
