# BookVerse

- A books application

## Langauges

### Frontend

- TypeScript (React Framework)

### Backend

- **Go (Go Lang)**: Majority of the bacjend was written in Go. It basically handle everything on the backend from authentication to books to transactions etc. The only thing it didnt handle is the Email service.
- **Node.js**: This was used to handle the emailing fo the applications such as welcome email, password reset email etc.

### Database

- PostgreSQL (No ORM)

### Backend Frameworks

- Mux (For easy routing in the Go server)
- Express (To manage our Node.js server)

### Message Queue

- Rabbit MQ: This was used for communication between the two servers, using the AMQP Protocol.
