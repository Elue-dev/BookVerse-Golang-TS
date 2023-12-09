import sendEmail from "../services/email_service";
import { establishRabbitConnection } from "./establish.connection";
import {
  EmailOptions,
  QueueMessage,
  ResponseArgs,
  SendResponseArgs,
} from "../types";
import { passwordResetEmail } from "../email_templates/forgot.password.email";
import { welcomeEmail } from "../email_templates/welcome.mail";
import { resetSuccess } from "../email_templates/reset.password.email";

export async function consumeFromRabbitMQAndSendEmail(queueName: string) {
  const channel = await establishRabbitConnection();
  await channel.assertQueue(queueName, { durable: false });

  channel.consume(queueName, async (queueMessage: QueueMessage) => {
    if (!queueMessage) {
      sendErrorResponse({
        channel,
        queueName,
        consumerTag: undefined,
      });

      return;
    }

    const [userEmail, username, userId, token] = queueMessage?.content
      .toString()
      .split(",");

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
      case "FORGOT_PASSWORD_QUEUE":
        emailOptions.SUBJECT = "Password reset request";
        emailOptions.BODY = passwordResetEmail({
          username: username,
          url: `${process.env.CLIENT_URL}/auth/reset-password/${token}/${userId}`,
        });
        break;
      case "RESET_PASSWORD_QUEUE":
        emailOptions.SUBJECT = `${username}, Your password was successfully reset`;
        emailOptions.BODY = resetSuccess({
          username,
        });
        break;
      default:
        sendErrorResponse({
          channel,
          queueName,
          consumerTag: undefined,
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
      });
    }

    channel.ack(queueMessage);
  });
}

function sendSuccessResponse({
  channel,
  queueName,
  consumerTag,
}: ResponseArgs) {
  sendResponse({
    channel,
    queueName,
    success: true,
    message: "Email has been successfully sent",
  });
  stopConsuming(channel, consumerTag!);
}

function sendErrorResponse({ channel, queueName, consumerTag }: ResponseArgs) {
  sendResponse({
    channel,
    queueName,
    success: false,
    message: "Error sending email",
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