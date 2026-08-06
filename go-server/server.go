package main

import (
	"bulet_websocket/websocketHandler"
	"fmt"
	"net/http"

	"bulet_websocket/jwtHandler"
	"github.com/gorilla/websocket"
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

	roomID := r.URL.Query().Get("room")
	if roomID == "" {
		roomID = "global"
	}

	accessToken := r.URL.Query().Get("token")
	claims, err := jwtHandler.ValidateSupabaseToken(accessToken)
	if err != nil {
		fmt.Println("Error: ", err)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer conn.Close()

	client := &websocketHandler.Client{
		ID:     claims.Subject,
		Conn:   conn,
		Pool:   pool,
		RoomID: roomID,
	}

	pool.Register <- client
	client.Read()
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
