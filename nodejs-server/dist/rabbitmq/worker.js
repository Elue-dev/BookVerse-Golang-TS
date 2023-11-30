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
exports.consumeFromRabbitMQAndSendEmail = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const welcome_mail_1 = require("../email_templates/welcome.mail");
const logger_1 = require("../helpers/logger");
const email_service_1 = __importDefault(require("../services/email_service"));
const rabbitMQURL = process.env.RABBIT_URL;
const queueName = "user_queue";
function consumeFromRabbitMQAndSendEmail() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield amqplib_1.default.connect(rabbitMQURL);
        const channel = yield connection.createChannel();
        yield channel.assertQueue(queueName, { durable: false });
        channel.consume(queueName, (queueMessage) => {
            const [userEmail, username] = queueMessage.content.toString().split(",");
            (0, logger_1.showLogs)("queueMessage", queueMessage);
            (0, logger_1.showLogs)("queueMessage.content", queueMessage.content);
            const subject = `Welcome Onboard, ${username}!`;
            const send_to = userEmail;
            const SENT_FROM = process.env.EMAIL_USER;
            const REPLY_TO = process.env.REPLY_TO;
            const body = (0, welcome_mail_1.welcomeEmail)(username);
            try {
                (0, email_service_1.default)({ subject, body, send_to, SENT_FROM, REPLY_TO });
                channel.sendToQueue(queueName, Buffer.from(JSON.stringify({
                    success: true,
                    message: `Email has been succefully sent to ${username}`,
                })));
            }
            catch (error) { }
            channel.ack(queueMessage);
        });
    });
}
exports.consumeFromRabbitMQAndSendEmail = consumeFromRabbitMQAndSendEmail;
