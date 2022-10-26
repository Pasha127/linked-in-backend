import { checkSchema, validationResult } from "express-validator"
import createHttpError from "http-errors"

const postSchema = {
  text: {
    in: ["body"],
    isString: {
      errorMessage: "Title is a mandatory field and needs to be a string!",
    },
  },
  username: {
    in: ["body"],
    isString: {
      errorMessage: "Category is a mandatory field and needs to be a string!",
    },
  },
  image: {
    in: ["body"],
    isString: {
      errorMessage: "Category is a mandatory field and needs to be a string!",
    },
  },
  user: {
    in: ["body"],
    isString: {
      errorMessage: "Category is a mandatory field and needs to be a string!",
    },
  },
  
}



export const checkPostSchema = checkSchema(postSchema) 
export const checkValidationResult = (req, res, next) => { 
  const errors = validationResult(req)
  if (!errors.isEmpty()) {   
    next(
      createHttpError(400, "Validation errors in request body!", {
        errorsList: errors.array(),
      })
    );
    console.log("400here", errors);
  } else {
    next()
  }
}