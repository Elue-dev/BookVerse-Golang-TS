"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = ({ subject, body, send_to, SENT_FROM, REPLY_TO }) => {
    const transporter = nodemailer_1.default.createTransport({
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
        if (err)
            return console.log(err);
        console.log("INFO", info);
    });
};
exports.default = sendEmail;
