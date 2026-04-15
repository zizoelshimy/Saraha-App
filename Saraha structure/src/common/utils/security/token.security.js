import jwt, { decode } from "jsonwebtoken";
import { NotFoundException, UnauthorizedException } from "../response/error.response.js";
import { tokenModel } from "../../../DB/model/index.js";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  SYSTEM_ACCESS_TOKEN_SECRET_KEY,
  SYSTEM_REFRESH_TOKEN_SECRET_KEY,
  USER_ACCESS_TOKEN_SECRET_KEY,
  USER_REFRESH_TOKEN_SECRET_KEY,
} from "../../../../config/config.service.js";
import { findOne, UserModel } from "../../../DB/index.js";
import { TokenTypeEnum } from "../../enums/security.enum.js";
import {
  BadRequestException,
  ConflictException,
} from "../response/error.response.js";
import { RuleEnum } from "../../enums/user.enum.js";
import { randomUUID } from 'node:crypto';
import { get, revokeTokenKey } from "../../services/redis.service.js";
export const generateToken = ({
  payload = {},
  secretKey = USER_ACCESS_TOKEN_SECRET_KEY,
  options = {},
} = {}) => {
  return jwt.sign(payload, secretKey, options);
};
export const verifyToken = ({
  token = {},
  secretKey = USER_ACCESS_TOKEN_SECRET_KEY,
} = {}) => {
  return jwt.verify(token, secretKey);
};

export const getTokenSignature = async ({
  tokenType = TokenTypeEnum.ACCESS, level
} = {}) => {
  const {accessSignuture,refreshSignature} =await detectSignatureLevel(level);
  let signuture = undefined;
  switch (tokenType) {
    case TokenTypeEnum.REFRESH:
      signuture = refreshSignature;
      break;
    case TokenTypeEnum.ACCESS:
      signuture = accessSignuture;
      break;
    default:
      throw BadRequestException({ message: "Invalid token type" });
  }
  return signuture;
};

export const detectSignatureLevel = async (level) => {
  let signutures = {accessSignuture:undefined,refreshSignature:undefined};
  switch (level) {
    case RuleEnum.admin:
      signutures={
        accessSignuture:SYSTEM_ACCESS_TOKEN_SECRET_KEY,
        refreshSignature:SYSTEM_REFRESH_TOKEN_SECRET_KEY
      }
      break;
    default:
      signutures={
        accessSignuture:USER_ACCESS_TOKEN_SECRET_KEY,
        refreshSignature:USER_REFRESH_TOKEN_SECRET_KEY
      }
      break;
  }
  return signutures;
};

export const decodeToken = async ({
  token,
  tokenType = TokenTypeEnum.ACCESS,
} = {}) => {
  const decodedToken = jwt.decode(token);
  console.log(decodedToken);
  if (!decodedToken?.aud?.length) {
    throw BadRequestException({ message: "Missing audience in token" });
  }
  const [tokenApproach,level] = decodedToken.aud || [];
  if (tokenApproach !== tokenType) {
    throw ConflictException({
      message:
        "Unexpected token mechanism we expected: " +
        tokenType +
        ", but got: " +
        tokenApproach,
    });
  }
  if (decodeToken.jti&& await get(revokeTokenKey ({userId: decodedToken.sub, jti: decodeToken.jti}))) {
    throw UnauthorizedException({ message: "Invalid login session" });
  }
  const secret = await getTokenSignature({ tokenType: tokenApproach,level });
  const verifiedData = jwt.verify(token, secret);
  console.log(verifiedData);
  const user = await findOne({
    model: UserModel,
    filter: { _id: verifiedData.userId },
  });
  if (!user) {
    throw NotFoundException({ message: "not registered account" });
  }
  console.log({changeCredentialsTime: user.changeCredentialsTime?.getTime(), iat: decodedToken.iat * 1000});
  if (user.changeCredentialsTime&&user.changeCredentialsTime?.getTime() >= decodedToken.iat * 1000) {
    throw UnauthorizedException({ message: "Invalid login session " });
  }
  return {user,decodedToken};
};

export const createLoginCredentials = async (user, issuer) => {
  const {accessSignuture,refreshSignature} =await detectSignatureLevel(user.role);
  const jwtid= randomUUID()
  const access_token = generateToken({
    payload: { userId: user._id }, //payload
    secretKey: accessSignuture, //secret key
    options: {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      issuer: issuer, // to specify the issuer of the token, which can be used for validation and verification purposes when the token is received by the server in subsequent requests
      audience: [TokenTypeEnum.ACCESS,user.role], // to specify the audience of the token, which can be used to restrict the token's usage to a specific user or group of users
      jwtid
    },
  });
  const refresh_token = generateToken({
    payload: { userId: user._id }, //payload
    secretKey: refreshSignature, //secret key
    options: {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: issuer, // to specify the issuer of the token, which can be used for validation and verification purposes when the token is received by the server in subsequent requests
      audience: [TokenTypeEnum.REFRESH,user.role], // to specify the audience of the token, which can be used to restrict the token's usage to a specific user or group of users
      jwtid
    },
  });
  return { access_token, refresh_token };
};
