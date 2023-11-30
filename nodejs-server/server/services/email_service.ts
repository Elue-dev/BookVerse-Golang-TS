import nodemailer from "nodemailer";
import { Email } from "../types";

const sendEmail = ({ subject, body, send_to, SENT_FROM, REPLY_TO }: Email) => {
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
    to: send_to,
    replyTo: REPLY_TO,
    subject: subject,
    html: body,
  };

  transporter.sendMail(options, function (err, info) {
    if (err) return console.log(err);

    console.log("INFO", info);
  });
};

export default sendEmail;
