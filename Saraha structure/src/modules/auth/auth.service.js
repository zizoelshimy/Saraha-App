import {
  BadRequestException,
  compareHash,
  ConflictException,
  createLoginCredentials,
  generateHash,
  NotFoundException,
} from "../../common/utils/index.js";
import { UserModel, findOne, createOne } from "../../DB/index.js";
import { hash, compare } from "bcrypt";
import {
  SALT_ROUND,
  USER_ACCESS_TOKEN_SECRET_KEY,
  USER_REFRESH_TOKEN_SECRET_KEY,
  GOOGLE_CLIENT_ID,
} from "../../../config/config.service.js";
import { HashApproachEnum } from "../../common/enums/security.enum.js";
import {
  generateDecryption,
  generateEncryption,
} from "../../common/utils/security/encryption.security.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { ProviderEnum } from "../../common/enums/user.enum.js";
export const signup = async (inputs) => {
  const { username, email, password, phone } = inputs;
  const checkUserExist = await findOne({
    model: UserModel,
    filter: { email },
  });
  if (checkUserExist) {
    return ConflictException({ message: "email already exist" });
  }
  const user = await createOne({
    model: UserModel,
    data: {
      username,
      email,
      password: await generateHash({
        plaintext: password,
        approach: HashApproachEnum.ARGON2,
      }),
      phone: await generateEncryption(phone),
    },
  });
  return { user };
};
export const login = async (inputs, issuer) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email , provider: ProviderEnum.System},
    options: { lean: false }, //to get the full mongoose document with its methods
  });
  if (!user) {
    throw NotFoundException({ message: "Invalid email or password" });
  }
  if (
    !(await compareHash({
      plaintext: password,
      cipherText: user.password,
      approach: HashApproachEnum.ARGON2,
    }))
  ) {
    throw NotFoundException({ message: "Invalid email or password" });
  }
  user.phone = await generateDecryption(user.phone);
  return createLoginCredentials(user, issuer);
};

const verifyGoogleAccount = async (idToken) => {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email_verified) {
    BadRequestException({ message: "fail to verify by google" });
  }
  return payload;
};

export const signupWithGmail = async (idToken, issuer) => {
  const payload = await verifyGoogleAccount(idToken);
  console.log(payload);
  const checkExist = await findOne({
    model: UserModel,
    filter: { email: payload.email },
  });
  if (checkExist) {
    if (checkExist.provider != ProviderEnum.Google) {
      throw ConflictException({ message: "Invalid provider" });
    }
    return {
      status: 200,
      Credentials: await createLoginCredentials(checkExist, issuer),
    };
  }
  const user = await createOne({
    model: UserModel,
    data: {
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      profilePicture: payload.picture,
      provider: ProviderEnum.Google,
      confirmEmail: new Date(),
    },
  });
  return {
    status: 201,
    Credentials: await createLoginCredentials(user, issuer),
  };
};
