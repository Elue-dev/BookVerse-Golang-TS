import { ConsumeMessage, Message } from "amqplib";

export type EmailOptions = {
  SUBJECT: string;
  BODY: string;
  SEND_TO: string;
  SENT_FROM: string;
  REPLY_TO: string;
};

export type passwordResetType = {
  username: string;
  url: string;
};

export type resetSuccessType = {
  username: string | undefined;
};

export type SuccessResponseArgs = {
  channel: any;
  queueName: string;
  consumerTag: string | undefined;
};

export type ErrorResponseArgs = {
  channel: any;
  queueName: string;
  consumerTag: string | undefined;
  message: string;
};

export type SendResponseArgs = {
  channel: any;
  queueName: string;
  success: boolean;
  message: string;
};

export type QueueMessage = ConsumeMessage | Message | null;
