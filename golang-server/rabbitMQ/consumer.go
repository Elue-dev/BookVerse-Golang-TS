package rabbitmq

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/elue-dev/BookVerse-Golang-TS/models"
	"github.com/streadway/amqp"
)

func ConsumeFromRabbitMQ(queueName string, callback func(models.QueueMessage)) {
	rabbitMQURL := os.Getenv("RABBIT_URL")

	conn, err := amqp.Dial(rabbitMQURL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %s", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %s", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		queueName,
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to declare a queue: %s", err)
	}

	msgs, err := ch.Consume(
		q.Name,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to register a consumer: %s", err)
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("Received a message: %s", d.Body)

			var queueMsg models.QueueMessage

			err := json.Unmarshal(d.Body, &queueMsg)
			if err != nil {
				fmt.Println("error unmarshalling json", err)
			}

			_, err = json.Marshal(queueMsg)
			if err != nil {
				fmt.Println("error marshalling json", err)
			}

			callback(queueMsg)

		}
	}()

	log.Printf("Waiting for messages in queue...")

	<-forever
}
