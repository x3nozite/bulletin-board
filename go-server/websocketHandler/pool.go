package websocketHandler

import (
	"encoding/json"
	"fmt"
)

type Pool struct {
	Register   chan *Client
	Unregister chan *Client
	Clients    map[*Client]bool
	Broadcast  chan Message
}

func NewPool() *Pool {
	return &Pool{
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Clients:    make(map[*Client]bool),
		Broadcast:  make(chan Message),
	}
}

func (pool *Pool) Start() {
	for {
		select {
		case client := <-pool.Register:
			pool.Clients[client] = true

			fmt.Println("Size of connection pool: ", len(pool.Clients))

			for client, _ := range pool.Clients {
				fmt.Println(client)
				client.Conn.WriteJSON(Message{Type: 1, Body: json.RawMessage("New User Joined.")})
			}

		case client := <-pool.Unregister:
			delete(pool.Clients, client)

			fmt.Println("Size of connection pool: ", len(pool.Clients))

			for client, _ := range pool.Clients {
				client.Conn.WriteJSON(Message{Type: 1, Body: json.RawMessage("User Disconnected.")})
			}
		case message := <-pool.Broadcast:
			fmt.Printf("Broadcasting message to pool: %+v", string(message.Body))

			for client, _ := range pool.Clients {
				if client == message.Sender {
					continue
				}

				if err := client.Conn.WriteJSON(message); err != nil {
					fmt.Println(err)
					return
				}
			}
		}
	}
}
