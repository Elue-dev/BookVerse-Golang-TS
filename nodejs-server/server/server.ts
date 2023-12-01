import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { consumeFromRabbitMQAndSendWelcomeEmail } from "./rabbitmq/welcome.publisher";
import { consumeFromRabbitMQAndSendFPasswordEmail } from "./rabbitmq/forgot.password.publisher";

console.log("Loading environment variables from .env file");
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
  consumeFromRabbitMQAndSendWelcomeEmail("welcome_user_queue");
  consumeFromRabbitMQAndSendFPasswordEmail("forgot_password_queue");
});
