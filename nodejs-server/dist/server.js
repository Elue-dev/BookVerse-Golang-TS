"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const welcome_publisher_1 = require("./rabbitmq/welcome.publisher");
const forgot_password_publisher_1 = require("./rabbitmq/forgot.password.publisher");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 9090;
app.get("/healthz", function (req, res) {
    res.status(200).json({
        message: "Node server healthy ✅",
    });
});
app.listen(PORT, function () {
    console.log(`Nodejs server listening on port ${PORT}`);
    (0, welcome_publisher_1.consumeFromRabbitMQAndSendWelcomeEmail)("welcome_user_queue");
    (0, forgot_password_publisher_1.consumeFromRabbitMQAndSendFPasswordEmail)("forgot_password_queue");
});
