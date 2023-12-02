# BookVerse

- A books application

### Frontend

- TypeScript (React Framework)

### Backend

- **Go (Go Lang)**: Majority of the backend was written in Go. It basically handle everything on the backend from authentication to books to transactions etc. The only thing it did not handle is the Email service.
- **Node.js**: This was used to handle the emailing for the application such as welcome email, password reset email etc.

### Database

- PostgreSQL (No ORM)

### Backend Frameworks

- **Mux**: (For easy routing in the Go server)
- **Express**: (To manage the Node.js server)

### Message Queue

- **Rabbit MQ**: This was used for communication between the two servers, using the AMQP Protocol. An example is, when a user is signed, the Go server sends the user information in the queue which is being picked up by the Node.js server which then sends the email and also sends a message to the queue when it is done sending the email so the Go seever then picks it up to know if it was successful or not.
