import { ConsumeMessage, Message } from "amqplib";
import { passwordResetEmail } from "../email_templates/forgot.password.email";
import sendEmail from "../services/email_service";
import { establishRabbitConnection } from "./connect";
import parser from "ua-parser-js";
import { Request } from "express";
import { resetSuccess } from "../email_templates/reset.password.email";

export async function consumeFromRabbitMQAndSendRPasswordEmail(
  queueName: string
) {
  const channel = await establishRabbitConnection();

  await channel.assertQueue(queueName, { durable: false });

  channel.consume(
    queueName,
    (queueMessage: ConsumeMessage | Message | null) => {
      let userEmail, username, userId, token;
      console.log(":content", queueMessage?.content.toString());

      if (queueMessage) {
        userEmail = queueMessage?.content.toString().split(",")[0];
        username = queueMessage?.content.toString().split(",")[1];
        userId = queueMessage?.content.toString().split(",")[2];
        token = queueMessage?.content.toString().split(",")[3];
        console.log({ token, userEmail, username, userId });
      }

      const subject = `${username}, Your password was successfully reset`;
      const send_to = userEmail!;
      const SENT_FROM = process.env.EMAIL_USER as string;
      const REPLY_TO = process.env.REPLY_TO as string;
      const body = resetSuccess({
        username: username,
      });

      try {
        sendEmail({ subject, body, send_to, SENT_FROM, REPLY_TO });
        channel.sendToQueue(
          queueName,
          Buffer.from(
            JSON.stringify({
              success: true,
              message:
                "Password reset success email has been successfully sent",
              data: [],
            })
          )
        );
      } catch (error) {
        console.error("Error sending email", error);
        channel.sendToQueue(
          queueName,
          Buffer.from(
            JSON.stringify({
              success: false,
              message: "Could not send password reset success email",
              data: [],
            })
          )
        );
      }

      channel.ack(queueMessage!);
    }
  );
}
