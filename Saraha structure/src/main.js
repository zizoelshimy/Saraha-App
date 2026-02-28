import { ENC_SECRET_KEY } from "../config/config.service.js";
import bootstrap from "./app.bootstrap.js";
import { generateEncryption,generateDecryption } from "./common/utils/security/encryption.security.js";
bootstrap()
//console.log({ENC_SECRET_KEY})
const EnC_RESULT = await generateEncryption("Hello World");
console.log(EnC_RESULT)
const DeC_RESULT = await generateDecryption(EnC_RESULT);
console.log(DeC_RESULT) 