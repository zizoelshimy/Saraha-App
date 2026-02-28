import {
  compareHash,
  ConflictException,
  createLoginCredentials,
  generateHash,
  NotFoundException,
} from "../../common/utils/index.js";
import { UserModel, findOne, createOne } from "../../DB/index.js";
import { hash, compare } from "bcrypt";
import { SALT_ROUND, USER_ACCESS_TOKEN_SECRET_KEY, USER_REFRESH_TOKEN_SECRET_KEY } from "../../../config/config.service.js";
import { HashApproachEnum } from "../../common/enums/security.enum.js";
import { generateDecryption, generateEncryption } from "../../common/utils/security/encryption.security.js";
import jwt from "jsonwebtoken";
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
      phone:await generateEncryption (phone),
    },
  });
  return { user };
};
export const login = async (inputs,issuer) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email },
    options: { lean: false }, //to get the full mongoose document with its methods
  });
  if (!user) {
    throw NotFoundException({ message: "Invalid email or password" });
  }
  if (!(await compareHash({ plaintext: password, cipherText: user.password, approach: HashApproachEnum.ARGON2 }))) {
    throw NotFoundException({ message: "Invalid email or password" });
  }
  user.phone = await generateDecryption(user.phone);
   return createLoginCredentials(user,issuer);

};
