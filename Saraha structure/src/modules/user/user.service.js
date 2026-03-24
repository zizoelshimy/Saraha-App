import { findOne } from "../../DB/database.repository.js";
import { UserModel, users } from "../../DB/model/index.js";
import { generateDecryption } from "../../common/utils/index.js";
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
export const profile = async (user) => {
  return user;
};
export const rotateToken = async (token, issuer) => {


  if (!token) {
    throw NotFoundException({ message: "not registered account" });
  }
  return createLoginCredentials(token, issuer);
};
export const profileImage=async(file,user)=>{
  user.profileImage=file.finalPath;
  await user.save();
  return user.profileImage;

}

export const shareProfile = async (userId) => {
  // Implementation for sharing profile
  const account = await findOne({model:UserModel, filter:{ _id: userId }, select:"-password "});
  if (!account) {
    throw NotFoundException({ message: "invalid share profile account" });
  }
  if(account.phone){
    account.generateDecryption = generateDecryption(account.phone);
  }
  return account;  
}
