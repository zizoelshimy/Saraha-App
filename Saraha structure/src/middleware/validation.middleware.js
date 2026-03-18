import { BadRequestException } from "../common/utils/index.js";
export const validation = (shcema) => {
  return async (req, res, next) => {
    const errors = [];
    for (const key of Object.keys(shcema)) {
      const validationResult = shcema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationResult.error) {
        errors.push({
          [key]: validationResult.error.details.map((ele) => {
            return { path: ele.path, message: ele.message };
          }),
        });
      }
    }
    if (errors.length > 0) {
      throw BadRequestException({ message: "validation error", extra: errors });
    }
    return next();
  };
};
