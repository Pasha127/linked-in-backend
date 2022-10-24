import { checkSchema, validationResult } from "express-validator"
import createHttpError from "http-errors"

const userSchema = {
        role: {
          isString: {
            errorMessage: "Role is a mandatory field and needs to be a string!",
          }
        },
        company: {
          isString: {
            errorMessage: "Company is a mandatory field and needs to be a string!",
          }
        },
        startDate:{
          isDate: {
            errorMessage: "Start date is a mandatory field and needs to be a date!",
          }
        },
        endDate: {

        },
        description: {
          isString: {
            errorMessage: "Description is a mandatory field and needs to be a string!",
          }
        },
        area: {
          isString: {
            errorMessage: "Area is a mandatory field and needs to be a string!",
          }
        }
  
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