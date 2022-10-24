import { checkSchema, validationResult } from "express-validator"
import createHttpError from "http-errors"

const userSchema = {
        name: {
          isString: {
            errorMessage: "Name is a mandatory field and needs to be a string!",
          }
        },
        surname: {
          isString: {
            errorMessage: "surname is a mandatory field and needs to be a string!",
          }
        },
        email:{
          isString: {
            errorMessage: "Email is a mandatory field and needs to be a date!",
          }
        },
        bio:{
          isString: {
            errorMessage: "Bio is a mandatory field and needs to be a date!",
          }
        },
        title: {
          isString: {
            errorMessage: "Title is a mandatory field and needs to be a string!",
          }
        },
        area: {
          isString: {
            errorMessage: "Area is a mandatory field and needs to be a string!",
          }
        },
        image: {
          isString: {
            errorMessage: "Image is a mandatory field and needs to be a string!",
          }
        },
        username: {
          isString: {
            errorMessage: "UserName is a mandatory field and needs to be a string!",
          }
        },
       

  
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