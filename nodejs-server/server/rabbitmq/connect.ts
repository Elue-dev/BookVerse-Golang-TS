import amqp from "amqplib";

const rabbitMQURL = process.env.RABBIT_URL as string;

export async function establishRabbitConnection() {
  const connection = await amqp.connect(rabbitMQURL);
  const channel = await connection.createChannel();

  return channel;
}
