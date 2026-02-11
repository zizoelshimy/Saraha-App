import { NODE_ENV, port } from "../config/config.service.js";
import { authRouter, userRouter } from "./modules/index.js";
import { authenticateDB } from "./DB/index.js";
import express from "express";
import { globalErrorHandling } from "./common/utils/index.js";

async function bootstrap() {
  const app = express();
  //convert buffer data
  app.use(express.json());
  //DB
  await authenticateDB();
  //application routing
  app.get("/", (req, res) => res.send("Hello World!"));
  app.use("/auth", authRouter);
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
