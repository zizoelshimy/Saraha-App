import joi from "joi";
import { Types } from "mongoose";
import { generalValidationFields } from "../../common/utils/index.js";
export const shareProfile = {
  params: generalValidationFields.id.required(),
};
