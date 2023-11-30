export type Email = {
  subject: string;
  body: string;
  send_to: string;
  SENT_FROM: string;
  REPLY_TO: string;
};

export type passwordResetType = {
  username: string;
  url: string;
};
