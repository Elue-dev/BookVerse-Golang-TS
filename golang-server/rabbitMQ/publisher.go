package rabbitmq

import (
	"fmt"

	"github.com/streadway/amqp"
)

const (
	RabbitMQURL = "amqp://guest:guest@localhost:5672/"
	QueueName   = "welcome_user_queue"
)

func SendToRabbitMQ(userEmail string, username string) error {
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
		QueueName, // name
		false,     // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		return err
	}

	message := fmt.Sprintf("%s,%s", userEmail, username)
	err = ch.Publish(
		"",     // exchange
		q.Name, // routing key
		false,  // mandatory
		false,  // immediate
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
