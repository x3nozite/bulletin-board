package websocketHandler

import (
	"encoding/json"
	"fmt"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID   string
	Conn *websocket.Conn
	Pool *Pool
}

type Message struct {
	Type   int             `json:"type"`
	Body   json.RawMessage `json:"body"`
	Sender *Client         `json:"-"`
}

func (c *Client) Read() {
	defer func() {
		c.Pool.Unregister <- c
		c.Conn.Close()
	}()

	for {
		msgType, p, err := c.Conn.ReadMessage()
		if err != nil {
			fmt.Println(err)
			return
		}

		msg := Message{Type: msgType, Body: p, Sender: c}
		c.Pool.Broadcast <- msg
		fmt.Printf("Client %s Received: %+v\n", c.ID, string(msg.Body))
	}
}
