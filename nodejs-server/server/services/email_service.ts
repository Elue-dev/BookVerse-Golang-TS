import Bottleneck from "bottleneck";
import nodemailer from "nodemailer";
import { EmailOptions } from "../types";

const limiter = new Bottleneck({
  maxConcurrent: 1, // Set the maximum number of concurrent requests
  minTime: 1000, // Set the minimum time between requests (in milliseconds)
});

const sendEmail = limiter.wrap(
  async ({ SUBJECT, BODY, SEND_TO, SENT_FROM, REPLY_TO }: EmailOptions) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const options = {
      from: SENT_FROM,
      to: SEND_TO,
      replyTo: REPLY_TO,
      subject: SUBJECT,
      html: BODY,
    };

    try {
      const info = await transporter.sendMail(options);
      console.log("INFO", info);
    } catch (err) {
      console.error(err);
    }
  }
);

export default sendEmail;
