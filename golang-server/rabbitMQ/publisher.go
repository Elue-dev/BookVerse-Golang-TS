package rabbitmq

import (
	"fmt"
	"os"

	"github.com/streadway/amqp"
)

func SendToRabbitMQ(userEmail string, username string) error {
	RabbitMQURL := os.Getenv("RABBIT_URL")
	QueueName := "welcome_user_queue"

	conn, err := amqp.Dial(RabbitMQURL)
	if err != nil {
		return err
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		QueueName,
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	message := fmt.Sprintf("%s,%s", userEmail, username)
	err = ch.Publish(
		"",
		q.Name,
		false,
		false,
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(message),
		})
	if err != nil {
		return err
	}

	fmt.Println("Successfully sent message to queue")

	return nil
}
