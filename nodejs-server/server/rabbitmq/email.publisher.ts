import sendEmail from "../services/email_service";
import { establishRabbitConnection } from "./establish.connection";
import {
  EmailOptions,
  ErrorResponseArgs,
  QueueMessage,
  SendResponseArgs,
  SuccessResponseArgs,
} from "../types";
import { welcomeEmail } from "../email_templates/welcome.mail";

export async function consumeFromRabbitMQAndSendEmail(queueName: string) {
  const channel = await establishRabbitConnection();
  await channel.assertQueue(queueName, { durable: false });

  channel.consume(queueName, async (queueMessage: QueueMessage) => {
    console.log({ redelivered: queueMessage?.fields.redelivered });

    if (!queueMessage) {
      sendErrorResponse({
        channel,
        queueName,
        consumerTag: undefined,
        message: "No message found in queue",
      });
      return;
    }

    const [userEmail, username, userId, token] = queueMessage?.content
      .toString()
      .split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);

    const emailOptions: EmailOptions = {
      SUBJECT: "",
      BODY: "",
      SEND_TO: userEmail,
      SENT_FROM: process.env.EMAIL_USER as string,
      REPLY_TO: process.env.REPLY_TO as string,
    };

    switch (queueName) {
      case "WELCOME_USER_QUEUE":
        emailOptions.SUBJECT = `Welcome Onboard, ${username}!`;
        emailOptions.BODY = welcomeEmail(username);
        break;
      default:
        sendErrorResponse({
          channel,
          queueName,
          consumerTag: undefined,
          message:
            "Queue name provided does not match the expected queue name (WELCOME_USER_QUEUE)",
        });
        return;
    }

    try {
      sendEmail(emailOptions);

      sendSuccessResponse({
        channel,
        queueName,
        consumerTag: queueMessage?.fields.consumerTag,
      });
    } catch (error) {
      console.error("Error sending email", error);
      sendErrorResponse({
        channel,
        queueName,
        consumerTag: queueMessage?.fields.consumerTag,
        message: `Error sending email, ${error}`,
      });
    }

    channel.ack(queueMessage);
  });
}

function sendSuccessResponse({
  channel,
  queueName,
  consumerTag,
}: SuccessResponseArgs) {
  sendResponse({
    channel,
    queueName,
    success: true,
    message: "Email has been successfully sent",
  });
  stopConsuming(channel, consumerTag!);
}

function sendErrorResponse({
  channel,
  queueName,
  consumerTag,
  message,
}: ErrorResponseArgs) {
  sendResponse({
    channel,
    queueName,
    success: false,
    message,
  });
  stopConsuming(channel, consumerTag!);
}

function stopConsuming(channel: any, consumerTag: string) {
  channel.cancel(consumerTag);
}

function sendResponse({
  channel,
  queueName,
  success,
  message,
}: SendResponseArgs) {
  channel.sendToQueue(
    queueName,
    Buffer.from(
      JSON.stringify({
        success,
        message,
        data: [],
      })
    )
  );
}
