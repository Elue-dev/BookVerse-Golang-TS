import { ConsumeMessage, Message } from "amqplib";
import { passwordResetEmail } from "../email_templates/forgot.password.email";
import sendEmail from "../services/email_service";
import { establishRabbitConnection } from "./connect";

export async function consumeFromRabbitMQAndSendFPasswordEmail(
  queueName: string
) {
  const channel = await establishRabbitConnection();

  await channel.assertQueue(queueName, { durable: false });

  channel.consume(
    queueName,
    (queueMessage: ConsumeMessage | Message | null) => {
      let userEmail, username, token;
      console.log(":content", queueMessage?.content.toString());

      if (queueMessage) {
        userEmail = queueMessage?.content.toString().split(",")[0];
        username = queueMessage?.content.toString().split(",")[1];
        token = queueMessage?.content.toString().split(",")[2];
        console.log({ token, userEmail, username });
      }
      const subject = "Password reset request";
      const send_to = userEmail as string;
      const SENT_FROM = process.env.EMAIL_USER as string;
      const REPLY_TO = process.env.REPLY_TO as string;

      const body = passwordResetEmail({
        username: username!,
        url: `${process.env.CLIENT_URL}/reset-password/${token}`,
      });

      try {
        sendEmail({ subject, body, send_to, SENT_FROM, REPLY_TO });
        channel.sendToQueue(
          queueName,
          Buffer.from(
            JSON.stringify({
              success: true,
              message: "Password reset email has been successfully sent",
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
              message: "Could not send password reset email",
              data: [],
            })
          )
        );
      }

      channel.ack(queueMessage!);
    }
  );
}
