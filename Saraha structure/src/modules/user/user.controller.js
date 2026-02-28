import { Router } from "express";
import { profile } from "./user.service.js";
import { successResponse } from "../../common/utils/index.js";
const router = Router();
import { rotateToken } from "./user.service.js";
router.get("/", async (req, res, next) => {
  const account = await profile(req.headers.authorization);
  return successResponse({
    res,
    message: "Profile retrieved successfully",
    data: account,
  });
});
router.get("/rotate-token", async (req, res, next) => {
  const credentials = await rotateToken(req.headers.authorization,`${req.protocol}://${req.get('host')}${req.originalUrl}`);//to know the issuer of the token which is the url of the rotate-token endpoint
  return successResponse({
    res,
    message: "Token rotated successfully",
    data: credentials,
  });
});

export default router;
