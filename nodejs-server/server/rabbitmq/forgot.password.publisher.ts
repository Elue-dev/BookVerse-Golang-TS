import { passwordResetEmail } from "../email_templates/forgot.password.email";
import sendEmail from "../services/email_service";
import { establishRabbitConnection } from "./connect";

export async function consumeFromRabbitMQAndSendFPasswordEmail(
  queueName: string
) {
  const channel = await establishRabbitConnection();

  await channel.assertQueue(queueName, { durable: false });

  channel.consume(queueName, (queueMessage: any) => {
    const [userEmail, username] = queueMessage.content.toString().split(",");

    const subject = "Password reset request";
    const send_to = userEmail;
    const SENT_FROM = process.env.EMAIL_USER as string;
    const REPLY_TO = process.env.REPLY_TO as string;
    const body = passwordResetEmail({
      username: username,
      url: `${process.env.CLIENT_URL}/forgot-password`,
    });

    try {
      sendEmail({ subject, body, send_to, SENT_FROM, REPLY_TO });
      channel.sendToQueue(
        queueName,
        Buffer.from(
          JSON.stringify({
            success: true,
            message: `Password reset email has been succefully sent to ${username}`,
          })
        )
      );
    } catch (error) {
      console.error("Error sending email", error);
    }

    channel.ack(queueMessage);
  });
}
