package jwtHandler

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
)

type UserClaims struct {
	Role string `json:"role"`
	jwt.RegisteredClaims
}

func ValidateSupabaseToken(tokenString string) (*UserClaims, error) {
	err := godotenv.Load("../.env.local")
	if err != nil {
		log.Println("No .env file found: ")
	}

	dicoveryUrl := os.Getenv("SUPABASE_JWT_DISCOVERY")
	if dicoveryUrl == "" {
		return nil, errors.New("Missing Discovery URL")
	}

	k, err := keyfunc.NewDefaultCtx(context.Background(), []string{dicoveryUrl})
	if err != nil {
		return nil, errors.New("Failed creating keyfunc")
	}

	claims := &UserClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, k.Keyfunc)
	if err != nil {
		return nil, fmt.Errorf("Error parsing token: %w", err)
	}
	if !token.Valid {
		return nil, fmt.Errorf("Invalid token")
	}

	return claims, nil
}
