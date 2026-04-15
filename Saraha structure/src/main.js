import { ENC_SECRET_KEY } from "../config/config.service.js";
import bootstrap from "./app.bootstrap.js";
import { generateEncryption,generateDecryption } from "./common/utils/security/encryption.security.js";
bootstrap()
//console.log({ENC_SECRET_KEY})
