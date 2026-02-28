import { findOne } from "../../DB/database.repository.js";
import { UserModel, users } from "../../DB/model/index.js";
import jwt from "jsonwebtoken";
import {
  USER_ACCESS_TOKEN_SECRET_KEY,
  USER_REFRESH_TOKEN_SECRET_KEY,
} from "../../../config/config.service.js";
import { NotFoundException } from "../../common/utils/index.js";
import {
  createLoginCredentials,
  decodeToken,
} from "../../common/utils/security/token.security.js";
import { TokenTypeEnum } from "../../common/enums/security.enum.js";
export const profile = async (token) => {
  const account = await decodeToken({ token, tokenType: TokenTypeEnum.ACCESS });
  return account;
};
export const rotateToken = async (token, issuer) => {
  const account = await decodeToken({
    token,
    tokenType: TokenTypeEnum.REFRESH,
  });

  if (!account) {
    throw NotFoundException({ message: "not registered account" });
  }
  return createLoginCredentials(account, issuer);
};
