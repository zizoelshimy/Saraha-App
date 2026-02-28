import { Router } from "express";
import { signup, login } from "./auth.service.js";
import { successResponse } from "../../common/utils/index.js";
const router = Router();
router.post("/signup", async (req, res, next) => {
  const account = await signup(req.body);
  return successResponse({
    res,
    status: 201,
    message: "User created successfully",
    data: account,
  });
});
router.post("/login", async (req, res, next) => {
  const credentials = await login(req.body,`${req.protocol}://${req.get('host')}${req.originalUrl}`);//to know the issuer of the token which is the url of the login endpoint
  return successResponse({
    res,
    status: 201,
    message: "User logged in successfully",
    data: credentials,
  });
});

export default router;
