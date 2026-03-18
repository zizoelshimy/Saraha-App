import { Router } from "express";
import { signup, login, signupWithGmail } from "./auth.service.js";
import { successResponse } from "../../common/utils/index.js";
const router = Router();
import * as validators from "./auth.validation.js";
import { validation } from "../../middleware/validation.middleware.js";

router.post(
  "/signup",
  validation(validators.signup),
  async (req, res, next) => {
    const user = await signup(req.body);
    return successResponse({
      res,
      status: 201,
      message: "User created successfully",
      data: user,
    });
  },
);
router.post("/login", validation(validators.login), async (req, res, next) => {
  const credentials = await login(
    req.body,
    `${req.protocol}://${req.get("host")}${req.originalUrl}`,
  );
  return successResponse({
    res,
    status: 201,
    message: "User logged in successfully",
    data: credentials,
  });
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
