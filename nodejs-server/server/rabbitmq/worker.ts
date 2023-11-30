import amqp from "amqplib";
import { welcomeEmail } from "../email_templates/welcome.mail";
import { showLogs } from "../helpers/logger";
import sendEmail from "../services/email_service";

const rabbitMQURL = process.env.RABBIT_URL as string;
const queueName = "user_queue";

export async function consumeFromRabbitMQAndSendEmail() {
  const connection = await amqp.connect(rabbitMQURL);
  const channel = await connection.createChannel();

  await channel.assertQueue(queueName, { durable: false });

  channel.consume(queueName, (queueMessage: any) => {
    const [userEmail, username] = queueMessage.content.toString().split(",");

    showLogs("queueMessage", queueMessage);
    showLogs("queueMessage.content", queueMessage.content);

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
    } catch (error) {}

    channel.ack(queueMessage);
  });
}
