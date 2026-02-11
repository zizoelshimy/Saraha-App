import {
  compareHash,
  ConflictException,
  generateHash,
  NotFoundException,
} from "../../common/utils/index.js";
import { UserModel, findOne, createOne } from "../../DB/index.js";
import { hash, compare } from "bcrypt";
import { SALT_ROUND } from "../../../config/config.service.js";
import { HashApproachEnum } from "../../common/enums/security.enum.js";
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
      phone,
    },
  });
  return { user };
};
export const login = async (inputs) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email },
    options: { lean: false }, //to get the full mongoose document with its methods
  });
  if (!user) {
    throw NotFoundException({ message: "Invalid email or password" });
  }
  if (!(await compareHash({ plaintext: password, cipherText: user.password }))) {
    throw NotFoundException({ message: "Invalid email or password" });
  }
  return user;
};
