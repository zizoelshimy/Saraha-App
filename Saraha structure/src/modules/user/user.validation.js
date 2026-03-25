import joi from "joi";
import { Types } from "mongoose";
import { generalValidationFields } from "../../common/utils/index.js";
import { fileFieldValidation } from "../../common/utils/multer/index.js";
export const shareProfile = {
  params: generalValidationFields.id.required(),
};
export const profileImage = {
  file: joi
    .object()
    .keys({
      fieldname: joi.string().required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi
        .string()
        .valid(...Object.values(fileFieldValidation.image))
        .required(),
      finalPath: joi.string().required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
      size: joi.number().required(),
    })
    .required(),
};

export const profileCoverImage = {
  files: joi
    .array()
    .items(
      joi.object().keys({
        fieldname: joi.string().required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi
          .string()
          .valid(...Object.values(fileFieldValidation.image))
          .required(),
        finalPath: joi.string().required(),
        destination: joi.string().required(),
        filename: joi.string().required(),
        path: joi.string().required(),
        size: joi.number().required(),
      }),
    )
    .required()
    .min(1)
    .max(5).required(),
};
