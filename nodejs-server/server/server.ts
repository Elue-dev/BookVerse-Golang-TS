import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { consumeFromRabbitMQAndSendWelcomeEmail } from "./rabbitmq/welcome.publisher";
import { consumeFromRabbitMQAndSendFPasswordEmail } from "./rabbitmq/forgot.password.publisher";
import { consumeFromRabbitMQAndSendRPasswordEmail } from "./rabbitmq/reset.password.publisher";

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
  consumeFromRabbitMQAndSendWelcomeEmail("WELCOME_USER_QUEUE");
  consumeFromRabbitMQAndSendFPasswordEmail("FORGOT_PASSWORD_QUEUE");
  consumeFromRabbitMQAndSendRPasswordEmail("RESET_PASSWORD_QUEUE");
});
