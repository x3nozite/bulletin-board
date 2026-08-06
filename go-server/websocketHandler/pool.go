package websocketHandler

import (
	"encoding/json"
	"fmt"
)

type Pool struct {
	Register   chan *Client
	Unregister chan *Client
	Clients    map[*Client]bool
	Rooms      map[string]map[*Client]bool
	Broadcast  chan Message
}

func NewPool() *Pool {
	return &Pool{
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Clients:    make(map[*Client]bool),
		Rooms:      make(map[string]map[*Client]bool),
		Broadcast:  make(chan Message),
	}
}

func (pool *Pool) Start() {
	for {
		select {
		case client := <-pool.Register:
			if pool.Rooms[client.RoomID] == nil {
				pool.Rooms[client.RoomID] = make(map[*Client]bool)
			}
			pool.Rooms[client.RoomID][client] = true

			fmt.Printf("Size of connection pool (room: %s): %d\n", client.RoomID, len(pool.Rooms[client.RoomID]))

			payload := map[string]string{
				"action":   "join",
				"clientId": client.ID,
			}
			body, _ := json.Marshal(payload)

			for c, _ := range pool.Rooms[client.RoomID] {
				payload := map[string]string{
					"action":   "join",
					"clientId": c.ID,
				}
				body, _ := json.Marshal(payload)
				client.Conn.WriteJSON(Message{Type: 1, Body: body, Sender: c})
			}

			for c, _ := range pool.Rooms[client.RoomID] {
				// client.Conn.WriteJSON(Message{Type: 1, Body: json.RawMessage("New User Joined.")})
				if c.ID == client.ID {
					continue
				}
				c.Conn.WriteJSON(Message{Type: 1, Body: body, Sender: client})
			}

		case client := <-pool.Unregister:
			delete(pool.Rooms[client.RoomID], client)

			fmt.Printf("Size of connection pool (room: %s): %d\n", client.RoomID, len(pool.Rooms[client.RoomID]))

			payload := map[string]string{
				"action":   "leave",
				"clientId": client.ID,
			}
			body, _ := json.Marshal(payload)

			if len(pool.Rooms[client.RoomID]) == 0 {
				delete(pool.Rooms, client.RoomID)
			}

			for c, _ := range pool.Rooms[client.RoomID] {
				// client.Conn.WriteJSON(Message{Type: 1, Body: json.RawMessage("New User Joined.")})
				if c.ID == client.ID {
					continue
				}
				c.Conn.WriteJSON(Message{Type: 1, Body: body, Sender: client})
			}
		case message := <-pool.Broadcast:
			for client, _ := range pool.Rooms[message.Sender.RoomID] {
				if client == message.Sender {
					continue
				}
				fmt.Printf("Sent to: %s in %s", client.ID, client.RoomID)

				if err := client.Conn.WriteJSON(message); err != nil {
					fmt.Println(err)
					return
				}
			}
		}
	}
}
