package main

import (
	"bulet_websocket/websocketHandler"
	"fmt"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"net/http"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool { // fine for testing, should be change before real deployment
		return true
	},
}

func enableCors(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func wsHandler(pool *websocketHandler.Pool, w http.ResponseWriter, r *http.Request) {
	enableCors(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer conn.Close()

	client := &websocketHandler.Client{
		ID:   uuid.NewString(),
		Conn: conn,
		Pool: pool,
	}

	pool.Register <- client
	client.Read()

	// for {
	// 	_, msg, err := conn.ReadMessage()
	// 	if err != nil {
	// 		fmt.Println(err)
	// 		break
	// 	}
	//
	// 	fmt.Printf("Received: %s\n", msg)
	//
	// 	err = conn.WriteMessage(websocket.TextMessage, msg)
	// 	if err != nil {
	// 		fmt.Println(err)
	// 		return
	// 	}
	// }
}

func main() {
	pool := websocketHandler.NewPool()
	go pool.Start()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		wsHandler(pool, w, r)
	})
	fmt.Println("websocket on port :8888")

	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		fmt.Println(err)
		return
	}
}
