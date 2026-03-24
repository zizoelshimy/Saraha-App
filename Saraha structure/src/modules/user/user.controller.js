import { Router } from "express";
import { profile } from "./user.service.js";
import { successResponse } from "../../common/utils/index.js";
const router = Router();
import { rotateToken } from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../middleware/authentication.middleware.js";
import { TokenTypeEnum } from "../../common/enums/security.enum.js";
import { RuleEnum } from "../../common/enums/user.enum.js";
import { shareProfile } from "./user.service.js";
import * as validators from "./user.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { localFileUpload } from "../../common/utils/multer/index.js";
import { profileImage } from "./user.service.js";
import { fileFieldValidation } from "../../common/utils/multer/index.js";
import { profileCoverImage } from "./user.service.js";
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
  },
);
router.get(
  "/:userId/share-profile",
  validation(validators.shareProfile),
  async (req, res, next) => {
    const account = await shareProfile(req.params.userId);
    return successResponse({
      res,
      message: "Profile retrieved successfully",
      data: account,
    });
  },
);
router.get(
  "/rotate-token",
  authentication(TokenTypeEnum.REFRESH),
  async (req, res, next) => {
    const credentials = await rotateToken(
      req.user,
      `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    ); //to know the issuer of the token which is the url of the rotate-token endpoint
    return successResponse({
      res,
      message: "Token rotated successfully",
      data: credentials,
    });
  },
);
//multer file upload for profile image
router.patch(
  "/profile-image",
  authentication(),
  localFileUpload({customPath:'users/profile-images', validation: fileFieldValidation.video, maxSize: 5 }).single("attachment"),
  async (req, res, next) => {
    const profileImagePath = await profileImage(req.file, req.user);
    return successResponse({
      res,
      data: { profileImagePath },
    });
  },
);

router.patch(
  "/profile-cover-image",
  authentication(),
  localFileUpload({customPath:'users/profile-images', validation: fileFieldValidation.image, maxSize: 5 }).fields([
      { name: "profileImage", maxCount: 1 },
      { name: "coverImages", maxCount: 2 },
      
  ]),
  async (req, res, next) => {
   const profileImagePath = await profileCoverImage(req.files, req.user);
    return successResponse({
      res,
      data: { profileImagePath },
    });
  },
);

export default router;
