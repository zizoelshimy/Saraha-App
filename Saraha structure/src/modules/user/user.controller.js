import { Router } from "express";
import { profile } from "./user.service.js";
import { successResponse } from "../../common/utils/index.js";
const router = Router();
import { rotateToken } from "./user.service.js";
import { authentication, authorization } from "../../middleware/authentication.middleware.js";
import { TokenTypeEnum } from "../../common/enums/security.enum.js";
import { RuleEnum } from "../../common/enums/user.enum.js";
router.get(
  "/",
  authentication(),
  authorization([RuleEnum.admin]),
   async (req, res, next) => {
  const account = await profile(req.user);
  return successResponse({
    res,
    message: "Profile retrieved successfully",
    data: account,
  });
});
router.get("/rotate-token", authentication(TokenTypeEnum.REFRESH), async (req, res, next) => {
  const credentials = await rotateToken(req.user,`${req.protocol}://${req.get('host')}${req.originalUrl}`);//to know the issuer of the token which is the url of the rotate-token endpoint
  return successResponse({
    res,
    message: "Token rotated successfully",
    data: credentials,
  });
});

export default router;
