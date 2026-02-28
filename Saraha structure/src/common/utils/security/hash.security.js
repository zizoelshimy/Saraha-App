import { SALT_ROUND } from "../../../../config/config.service.js";
import { compare, genSalt, hash } from "bcrypt";
import * as argon2 from "argon2";
import { HashApproachEnum } from "../../enums/security.enum.js";
export const generateHash = async ({
  plaintext,
  saltRounds = SALT_ROUND,
  minor = "b",
  approach = HashApproachEnum.BCRYPT,
} = {}) => {
  let hashValue;
  switch (approach) {
    case HashApproachEnum.ARGON2:
      hashValue = await argon2.hash(plaintext);
      break;
    default:
      const generatedSalt = await genSalt(saltRounds, minor);
      hashValue = await hash(plaintext, generatedSalt);
      break;
  }
  return hashValue;
};
export const compareHash = async ({
  plaintext,
  cipherText,
  approach = HashApproachEnum.BCRYPT,
} = {}) => {
  let match = false;
  switch (approach) {
    case HashApproachEnum.ARGON2:
      match = await argon2.verify(cipherText, plaintext);
      break;
    default:
      match = await compare(plaintext, cipherText);
      break;
  }
  return match;
};
