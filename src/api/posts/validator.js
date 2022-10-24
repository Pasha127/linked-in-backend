import { checkSchema, validationResult } from "express-validator"
import createHttpError from "http-errors"

const userSchema = {
 //schema
  
}



export const checkUserSchema = checkSchema(userSchema) 
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