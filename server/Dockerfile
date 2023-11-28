# Builder Stage
FROM golang:1.19 AS builder

WORKDIR /app

COPY . .

RUN go build -o main main.go

# Run Stage
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/main .

EXPOSE 8080

CMD [ "/app/main" ]
