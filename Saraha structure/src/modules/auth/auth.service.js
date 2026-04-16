import {
  BadRequestException,
  compareHash,
  ConflictException,
  createLoginCredentials,
  createNumberOtp,
  emailEvent,
  emailTemplate,
  generateHash,
  NotFoundException,
  sendEmail,
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
import {
  otpKey,
  set,
  get,
  ttl,
  incr,
  deleteKey,
  maxAttemptsOtpKey,
  blockOtpKey,
} from "../../common/services/redis.service.js";
import { EmailEnum } from "../../common/enums/email.enum.js";

const clearOtpState = async (email, subject = EmailEnum.ConfirmEmail) => {
  await deleteKey([
    otpKey(email, subject),
    maxAttemptsOtpKey(email, subject),
    blockOtpKey(email, subject),
  ]);
};

const sendEmailOtp = async ({ email, subject, title } = {}) => {
  const isBlocked = await ttl(blockOtpKey(email, subject));
  if (isBlocked > 0) {
    return BadRequestException({
      message: `Sorry, you have been blocked from requesting new OTPs.while you are blocked. Please try again after ${isBlocked} seconds`,
    });
  }

  const remainingOtpTTL = await ttl(otpKey(email, subject));
  if (remainingOtpTTL > 0) {
    return BadRequestException({
      message: `Sorry, you cannot request a new OTP while the current OTP is still valid. Please try again after ${remainingOtpTTL} seconds`,
    });
  }
  // Check the number of resend attempts and block if it exceeds the limit
  const maxtrial = Number((await get(maxAttemptsOtpKey(email, subject))) || 0);
  if (maxtrial >= 3) {
    await set({ key: blockOtpKey(email, subject), value: 1, ttl: 7 * 60 });
    return BadRequestException({
      message: `Sorry, you have exceeded the maximum number of OTP resend attempts. Please try again after 7 minutes`,
    });
  }
  const code = await createNumberOtp();
  await set({
    key: otpKey(email, subject),
    value: await generateHash({
      plaintext: `${code}`,
    }),
    ttl: 120,
  });
  emailEvent.emit("sendEmail", async () => {
    await sendEmail({
      to: email,
      subject,
      html: emailTemplate({ code, title }),
    });
    await incr(maxAttemptsOtpKey(email, subject));
  });
};

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
  await clearOtpState(email, EmailEnum.ConfirmEmail);
  await sendEmailOtp({
    email,
    subject: EmailEnum.ConfirmEmail,
    title: "Verify your email for Saraha account",
  });
  return { user };
};

export const confirmEmail = async (inputs) => {
  const { email, otp } = inputs;
  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      $or: [{ confirmEmail: { $exists: false } }, { confirmEmail: null }],
      provider: ProviderEnum.System,
    },
  });
  if (!account) {
    return NotFoundException({
      message: "Account not found or already confirmed",
    });
  }
  const hashOtp = await get(otpKey(email, EmailEnum.ConfirmEmail));
  if (!hashOtp) {
    return NotFoundException({ message: "OTP expired" });
  }
  if (
    !(await compareHash({
      plaintext: otp,
      cipherText: hashOtp,
    }))
  ) {
    return ConflictException({ message: "Invalid OTP" });
  }
  account.confirmEmail = new Date();
  await account.save();
  await clearOtpState(email, EmailEnum.ConfirmEmail);

  return account;
};

//resend confirm email we make this bec if we sign up and the otp is expired we can resend the otp without signing up again
export const resendConfirmEmail = async (inputs) => {
  const { email } = inputs;
  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      $or: [{ confirmEmail: { $exists: false } }, { confirmEmail: null }],
      provider: ProviderEnum.System,
    },
  });
  if (!account) {
    return NotFoundException({
      message: "Account not found or already confirmed",
    });
  }
  await sendEmailOtp({
    email,
    subject: EmailEnum.ConfirmEmail,
    title: "Verify your email for Saraha account",
  });
  return;
};

export const login = async (inputs, issuer) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email, provider: ProviderEnum.System },
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
