# Builder Stage
FROM golang:1.19 AS builder

WORKDIR /app

COPY go.mod .

COPY go.sum .

COPY .env .

RUN go mod download

COPY . ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main main.go

# Run Stage
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/main .

COPY --from=builder /app/.env .

EXPOSE 8080

CMD [ "./main" ]
