import crypto from 'node:crypto';
import { IV_LENGTH } from '../../../../config/config.service.js';
import { ENC_SECRET_KEY } from '../../../../config/config.service.js';
export const generateEncryption = async(plainText) => {
    //first step come here 
//console.log(crypto.randomBytes(IV_LENGTH).toString('hex')) //this only to generate random IV for encryption and decryption process, it should be stored in the database with the cipher text to be used in decryption process

const iv = crypto.randomBytes(IV_LENGTH);
const cipher = crypto.createCipheriv('aes-256-cbc', ENC_SECRET_KEY, iv);
let cipherText = cipher.update(plainText, 'utf-8', 'hex');
cipherText += cipher.final('hex');
return `${iv.toString('hex')}:${cipherText}`;
}
export const generateDecryption = async(cipherText) => {
    const [iv, encryptedData] = cipherText.split(':') || [];
    const ivLikeBinary = Buffer.from(iv, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', ENC_SECRET_KEY, ivLikeBinary);
let plainText = decipher.update(encryptedData, 'hex', 'utf-8');
plainText += decipher.final('utf-8');
return plainText;

}