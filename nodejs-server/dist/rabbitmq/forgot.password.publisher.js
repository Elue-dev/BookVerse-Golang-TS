"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeFromRabbitMQAndSendFPasswordEmail = void 0;
const forgot_password_email_1 = require("../email_templates/forgot.password.email");
const email_service_1 = __importDefault(require("../services/email_service"));
const connect_1 = require("./connect");
function consumeFromRabbitMQAndSendFPasswordEmail(queueName) {
    return __awaiter(this, void 0, void 0, function* () {
        const channel = yield (0, connect_1.establishRabbitConnection)();
        yield channel.assertQueue(queueName, { durable: false });
        channel.consume(queueName, (queueMessage) => {
            const [userEmail, username] = queueMessage.content.toString().split(",");
            const subject = "Password reset request";
            const send_to = userEmail;
            const SENT_FROM = process.env.EMAIL_USER;
            const REPLY_TO = process.env.REPLY_TO;
            const body = (0, forgot_password_email_1.passwordResetEmail)({
                username: username,
                url: `${process.env.CLIENT_URL}/forgot-password`,
            });
            try {
                (0, email_service_1.default)({ subject, body, send_to, SENT_FROM, REPLY_TO });
                channel.sendToQueue(queueName, Buffer.from(JSON.stringify({
                    success: true,
                    message: `Password reset email has been succefully sent to ${username}`,
                })));
            }
            catch (error) {
                console.error("Error sending email", error);
            }
            channel.ack(queueMessage);
        });
    });
}
exports.consumeFromRabbitMQAndSendFPasswordEmail = consumeFromRabbitMQAndSendFPasswordEmail;
