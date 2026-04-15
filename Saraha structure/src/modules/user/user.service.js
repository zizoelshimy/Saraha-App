import {
  createOne,
  findByIdAndUpdate,
  findOne,
} from "../../DB/database.repository.js";
import { tokenModel, UserModel, users } from "../../DB/model/index.js";
import { ConflictException, generateDecryption } from "../../common/utils/index.js";
import jwt from "jsonwebtoken";
import {
  REFRESH_TOKEN_EXPIRES_IN,
  USER_ACCESS_TOKEN_SECRET_KEY,
  USER_REFRESH_TOKEN_SECRET_KEY,
} from "../../../config/config.service.js";
import { NotFoundException } from "../../common/utils/index.js";
import {
  createLoginCredentials,
  decodeToken,
} from "../../common/utils/security/token.security.js";
import { LogOutEnum, TokenTypeEnum } from "../../common/enums/security.enum.js";
import {baseRevokeTokenKey, deleteKey, revokeTokenKey, set} from "../../common/services/redis.service.js";

const createRevokeToken = async ({userId, jti, ttl})=>{
  await set({
        key:revokeTokenKey({userId, jti}),
        value: jti,
        ttl
      });
      return;
}


export const profile = async (user) => {
  return user;
};
export const rotateToken = async (token,{sub,jti, iat}, issuer) => {
  if (!token) {
    throw NotFoundException({ message: "not registered account" });
  }
  if((iat+REFRESH_TOKEN_EXPIRES_IN)*1000>= Date.now()+(5*60*1000)){
    throw ConflictException({ message: "current token is still valid" });
  }
  await createRevokeToken({userId: sub, jti, ttl: iat + REFRESH_TOKEN_EXPIRES_IN });
  return createLoginCredentials(token, issuer);
};
export const profileImage = async (file, user) => {
  const imagePath = file.finalPath;
  await findByIdAndUpdate({
    id: user._id,
    model: UserModel,
    update: { profilePicture: imagePath },
  });
  return imagePath;
};

export const profileCoverImage = async (files, user) => {
  const coverPaths = files.map((file) => file.finalPath);
  await findByIdAndUpdate({
    id: user._id,
    model: UserModel,
    update: { coverProfilePictures: coverPaths },
  });
  return coverPaths;
};

export const shareProfile = async (userId) => {
  // Implementation for sharing profile
  const account = await findOne({
    model: UserModel,
    filter: { _id: userId },
    select: "-password ",
  });
  if (!account) {
    throw NotFoundException({ message: "invalid share profile account" });
  }
  if (account.phone) {
    account.generateDecryption = generateDecryption(account.phone);
  }
  return account;
};


//logout 

export const logout = async ({ flag }, user, { jti, iat,sub }) => {
  if (!user) {
    throw NotFoundException({ message: "invalid logout request" });
  }

  if (!jti || !iat) {
    throw NotFoundException({ message: "missing token metadata for logout" });
  }

  let status = 200;
  switch (flag) {
    case LogOutEnum.All:
      user.changeCredentialsTime = new Date();
      await user.save();
      await deleteKey(await keys(baseRevokeTokenKey({userId: sub})));
      break;
    default:
      await createRevokeToken({userId: sub, jti, ttl: iat + REFRESH_TOKEN_EXPIRES_IN });
      status = 201;
      break;
  }
  return status;
};
 