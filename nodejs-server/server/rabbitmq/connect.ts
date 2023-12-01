import amqp from "amqplib";

export async function establishRabbitConnection() {
  const connection = await amqp.connect(process.env.RABBIT_URL as string);
  const channel = await connection.createChannel();

  return channel;
}
