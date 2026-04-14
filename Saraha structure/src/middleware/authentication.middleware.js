import { TokenTypeEnum } from "../common/enums/index.js";
import { decodeToken } from "../common/utils/security/token.security.js";
import { login } from "../modules/auth/auth.service.js";
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "../common/utils/index.js";
export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    const [schema, credential] = req.headers.authorization?.split(" ") || [];
    console.log({ authorization, schema, credential });
    if (!schema || !credential) {
      throw UnauthorizedException({
        message: "missing authentication key or invalid approach",
      });
    }
    switch (schema) {
      case "Bearer":
        {
          const { user, decodedToken } = await decodeToken({
            token: credential,
            tokenType,
          });
          req.user = user;
          req.decodeToken = decodedToken;
        }
        break;
      case "Basic":
        const [username, password] = Buffer.from(credential, "base64")
          .toString()
          .split(":");
        console.log(username, password);
        break;
      default:
        const { user, decodedToken } = await decodeToken({
          token: credential,
          tokenType,
        });
        req.user = user;
        req.decodeToken = decodedToken;
        break;
    }

    next();
  };
};

export const authorization = (accessRoles = []) => {
  return async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      throw ForbiddenException({
        message: "You don't have permission to access this resource",
      });
    }
    next();
  };
};
