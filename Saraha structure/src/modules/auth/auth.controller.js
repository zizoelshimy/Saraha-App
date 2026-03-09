import { Router } from "express";
import { signup, login, signupWithGmail } from "./auth.service.js";
import { successResponse } from "../../common/utils/index.js";
const router = Router();
router.post("/signup", async (req, res, next) => {
  try {
    const account = await signup(req.body);
    return successResponse({
      res,
      status: 201,
      message: "User created successfully",
      data: account,
    });
  } catch (error) {
    next(error);
  }
});
router.post("/login", async (req, res, next) => {
  try {
    const credentials = await login(
      req.body,
      `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    ); //to know the issuer of the token which is the url of the login endpoint
    return successResponse({
      res,
      status: 201,
      message: "User logged in successfully",
      data: credentials,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/signup/gmail", async (req, res, next) => {
  try {
    const { status, Credentials } = await signupWithGmail(
      req.body.idToken,
      `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    ); //to know the issuer of the token which is the url of the signup/gmail endpoint
    return successResponse({
      res,
      status,
      data: { ...Credentials },
    });
  } catch (error) {
    next(error);
  }
});
export default router;
