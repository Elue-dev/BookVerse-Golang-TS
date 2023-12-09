import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { consumeFromRabbitMQAndSendEmail } from "./rabbitmq/email.publisher";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 9090;

app.get("/healthz", function (req: Request, res: Response) {
  res.status(200).json({
    message: "Node server healthy ✅",
  });
});

app.listen(PORT, function () {
  console.log(`Nodejs server listening on port ${PORT}`);
  consumeFromRabbitMQAndSendEmail("WELCOME_USER_QUEUE");
  //TODO: implement forgot password and reset password queue
});
