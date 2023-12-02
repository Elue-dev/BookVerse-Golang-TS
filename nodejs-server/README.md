# Nodejs Server For BookVerse v2

## Languages

- [TypeScript (Node.js)](https://nodejs.org)

## Database

- **[PostgreSQL](https://www.postgresql.org)**: An open source relational database which uses SQL for reading and writing data to the database.

## Framework

- **[Express](https://expressjs.com/)**: To manage the Node.js server.

## Libraries

- **[amqplib](https://github.com/joho/godotenv)**: A library for making AMQP 0-9-1 clients for Node.JS, and an AMQP 0-9-1 client for Node.JS v10+.
- **[Nodemailer](https://github.com/nodemailer/nodemailer)**: was used in this server for sending emails.
- **[dotenv](https://github.com/motdotla/dotenv)**: was used to manage environment variables.

### Message Queue

- **[Rabbit MQ](https://www.rabbitmq.com)**: This was used for communication between the two servers, using the AMQP Protocol. An example is, when a user is signed, the Go server sends the user information in the queue which is being picked up by the this Node.js server which then sends the email and also sends a message to the queue when it is done sending the email so the Go seever then picks it up to know if it was successful or not.
