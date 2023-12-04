import { ConsumeMessage, Message } from "amqplib";
import { welcomeEmail } from "../email_templates/welcome.mail";
import sendEmail from "../services/email_service";
import { establishRabbitConnection } from "./connect";

export async function consumeFromRabbitMQAndSendWelcomeEmail(
  queueName: string
) {
  const channel = await establishRabbitConnection();

  await channel.assertQueue(queueName, { durable: false });

  channel.consume(
    queueName,
    (queueMessage: ConsumeMessage | Message | null) => {
      let userEmail, username, userId, token;
      if (queueMessage) {
        userEmail = queueMessage?.content.toString().split(",")[0];
        username = queueMessage?.content.toString().split(",")[1];
        userId = queueMessage?.content.toString().split(",")[2];
        token = queueMessage?.content.toString().split(",")[3];
      }

      const subject = `Welcome Onboard, ${username}!`;
      const send_to = userEmail as string;
      const SENT_FROM = process.env.EMAIL_USER as string;
      const REPLY_TO = process.env.REPLY_TO as string;
      const body = welcomeEmail(username!);

      try {
        sendEmail({ subject, body, send_to, SENT_FROM, REPLY_TO });
        channel.sendToQueue(
          queueName,
          Buffer.from(
            JSON.stringify({
              success: true,
              message: "Email has been succefully sent",
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
              message: "Error sending email",
              data: [],
            })
          )
        );
      }

      channel.ack(queueMessage!);
    }
  );
}
