import { NODE_ENV, port } from "../config/config.service.js";
import { authRouter, userRouter } from "./modules/index.js";
import { authenticateDB } from "./DB/index.js";
import express from "express";
import { globalErrorHandling, sendEmail } from "./common/utils/index.js";
import { connectRedis, redisCLIENT } from "./DB/redis.connection.db.js";
import cors from "cors";
import { set } from "./common/services/redis.service.js";
async function bootstrap() {
  const app = express();
  //convert buffer data
  app.use(cors());
  app.use(express.json());
  //DB
  await authenticateDB();
  await connectRedis();
  try {
    await sendEmail({
      to: "zizoelshimy8@gmail.com",
      cc: ["ahmedelshimy92@gmail.com", "fateneldawey96@gmail.com"],
      bcc: "rgaber160@gmail.com",
      subject: "Test Email from Saraha App",
      html: "<h1> Hello from Saraha App </h1><p>This is a test email sent using Nodemailer.</p>",
    });
  } catch (error) {
    if (NODE_ENV === "development") {
      console.error("Email test failed during bootstrap:", error.message);
    } else {
      throw error;
    }
  }
  //application routing
  app.get("/", (req, res) => res.send("Hello World!"));
  app.use("/auth", authRouter);
  app.use("/user", authRouter);
  app.use("/user", userRouter);

  //invalid routing
  app.use("{/*dummy}", (req, res) => {
    return res.status(404).json({ message: "Invalid application routing" });
  });

  //error-handling
  app.use(globalErrorHandling);

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}
export default bootstrap;
