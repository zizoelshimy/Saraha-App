import nodemailer from "nodemailer";
import {
  APPLICATION_NAME,
  EMAIL_ALLOW_INVALID_CERT,
  EMAIL_APP,
  EMAIL_APP_PASSWORD,
} from "../../../../config/config.service.js";

export const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  html,
  attachments = [],
} = {}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_APP,
      pass: EMAIL_APP_PASSWORD,
    },
    // Use only in local development when corporate proxy/AV injects self-signed certs.
    tls: {
      rejectUnauthorized: !EMAIL_ALLOW_INVALID_CERT,
    },
  });
  try {
    const info = await transporter.sendMail({
      to,
      cc,
      bcc,
      subject,
      html,
      attachments,
      from: `"${APPLICATION_NAME}" <${EMAIL_APP}>`,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    if (error?.code === "ESOCKET") {
      throw new Error(
        "SMTP TLS verification failed. If you are in local development behind a proxy/self-signed cert, set EMAIL_ALLOW_INVALID_CERT=true in your env.",
      );
    }
    throw error;
  }
};
