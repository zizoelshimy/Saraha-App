import jwt, { decode } from "jsonwebtoken";
import {
  USER_ACCESS_TOKEN_SECRET_KEY,
  USER_REFRESH_TOKEN_SECRET_KEY,
} from "../../../../config/config.service.js";
import { findOne, UserModel } from "../../../DB/index.js";
import { TokenTypeEnum } from "../../enums/security.enum.js";
import {
  BadRequestException,
  ConflictException,
} from "../response/error.response.js";
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
  tokenType = TokenTypeEnum.ACCESS,
} = {}) => {
  let signuture = undefined;
  switch (tokenType) {
    case TokenTypeEnum.REFRESH:
      signuture = USER_REFRESH_TOKEN_SECRET_KEY;
      break;
    case TokenTypeEnum.ACCESS:
      signuture = USER_ACCESS_TOKEN_SECRET_KEY;
      break;
    default:
      throw BadRequestException({ message: "Invalid token type" });
  }
  return signuture;
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
  const [tokenApproach] = decodedToken.aud || [];
  if (tokenApproach !== tokenType) {
    throw ConflictException({
      message:
        "Unexpected token mechanism we expected: " +
        tokenType +
        ", but got: " +
        tokenApproach,
    });
  }

  const secret = await getTokenSignature({ tokenType: tokenApproach });
  const verifiedData = jwt.verify(token, secret);
  console.log(verifiedData);
  const user = await findOne({
    model: UserModel,
    filter: { _id: verifiedData.userId },
  });
  if (!user) {
    throw NotFoundException({ message: "not registered account" });
  }
  return user;
};

export const createLoginCredentials = async (user, issuer) => {
  const access_token = generateToken({
    payload: { userId: user._id }, //payload
    secretKey: USER_ACCESS_TOKEN_SECRET_KEY, //secret key
    options: {
      expiresIn: 1800,
      issuer: issuer, // to specify the issuer of the token, which can be used for validation and verification purposes when the token is received by the server in subsequent requests
      audience: [TokenTypeEnum.ACCESS], // to specify the audience of the token, which can be used to restrict the token's usage to a specific user or group of users
    },
  });
  const refresh_token = generateToken({
    payload: { userId: user._id }, //payload
    secretKey: USER_REFRESH_TOKEN_SECRET_KEY, //secret key
    options: {
      expiresIn: 60 * 60 * 24 * 365,
      issuer: issuer, // to specify the issuer of the token, which can be used for validation and verification purposes when the token is received by the server in subsequent requests
      audience: [TokenTypeEnum.REFRESH], // to specify the audience of the token, which can be used to restrict the token's usage to a specific user or group of users
    },
  });
  return { access_token, refresh_token };
};
