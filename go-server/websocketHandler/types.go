package websocketHandler

type Note struct {
	ID     string  `json:"id"`
	X      float64 `json:"x"`
	Y      float64 `json:"y"`
	Width  float64 `json:"width"`
	Height float64 `json:"height"`
	Text   string  `json:"text"`
}

type WSMessage struct {
	Action string `json:"action"`
	Note   Note   `json:"note"`
}
