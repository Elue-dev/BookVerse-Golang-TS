import { welcomeEmail } from "../email_templates/welcome.mail";
import sendEmail from "../services/email_service";
import { establishRabbitConnection } from "./connect";

export async function consumeFromRabbitMQAndSendWelcomeEmail(
  queueName: string
) {
  const channel = await establishRabbitConnection();

  await channel.assertQueue(queueName, { durable: false });

  channel.consume(queueName, (queueMessage: any) => {
    const [userEmail, username] = queueMessage.content.toString().split(",");

    const subject = `Welcome Onboard, ${username}!`;
    const send_to = userEmail;
    const SENT_FROM = process.env.EMAIL_USER as string;
    const REPLY_TO = process.env.REPLY_TO as string;
    const body = welcomeEmail(username);

    try {
      sendEmail({ subject, body, send_to, SENT_FROM, REPLY_TO });
      channel.sendToQueue(
        queueName,
        Buffer.from(
          JSON.stringify({
            success: true,
            message: `Email has been succefully sent to ${username}`,
          })
        )
      );
    } catch (error) {
      console.error("Error sending email", error);
    }

    channel.ack(queueMessage);
  });
}
