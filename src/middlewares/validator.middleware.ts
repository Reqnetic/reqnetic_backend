import { RequestHandler } from "express";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { sanitize, Trim } from "class-sanitizer";
import { HttpException } from "../exceptions/http.exception";

function ValidatorMiddleware(
  type: any,
  skipMissingProperties = false
): RequestHandler {
  return (req, res, next) => {
    const dtoObj = plainToInstance(type, req.body);
    validate(dtoObj, { skipMissingProperties }).then(
      (errors: ValidationError[]) => {
        if (errors.length > 0) {
          const dtoErrors = "Some data supplied were not accepted";
          next(
            new HttpException(
              400,
              dtoErrors,
              errors
                .map((error: ValidationError) =>
                  (Object as any).values(error.constraints)
                )
                .flat()
            )
          );
        } else {
          //sanitize the object and call the next middleware
          sanitize(dtoObj);
          req.body = dtoObj;
          next();
        }
      }
    );
  };
}

export default ValidatorMiddleware;
