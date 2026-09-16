package ai

import (
	"bufio"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

const (
	DefaultGeminiModel = "gemini-3.8-flash"
	GeminiAPIBaseURL   = "https://generativelanguage.googleapis.com/v1beta/models"
)

type Part struct {
	Text       string      `json:"text,omitempty"`
	InlineData *InlineData `json:"inline_data,omitempty"`
}

type InlineData struct {
	MimeType string `json:"mime_type"`
	Data     string `json:"data"` // Base64
}

type Content struct {
	Role  string `json:"role,omitempty"` // "user" | "model"
	Parts []Part `json:"parts"`
}

type SystemInstruction struct {
	Parts []Part `json:"parts"`
}

type GenerationConfig struct {
	Temperature      float32 `json:"temperature,omitempty"`
	ResponseMimeType string  `json:"response_mime_type,omitempty"`
}

type GeminiRequest struct {
	Contents          []Content          `json:"contents"`
	SystemInstruction *SystemInstruction `json:"system_instruction,omitempty"`
	GenerationConfig  *GenerationConfig  `json:"generation_config,omitempty"`
}

type APIError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Status  string `json:"status"`
}

type CandidateContent struct {
	Role  string `json:"role"`
	Parts []Part `json:"parts"`
}

type Candidate struct {
	Content      CandidateContent `json:"content"`
	FinishReason string           `json:"finishReason,omitempty"`
	Index        int              `json:"index,omitempty"`
}

type UsageMetadata struct {
	PromptTokenCount     int `json:"promptTokenCount"`
	CandidatesTokenCount int `json:"candidatesTokenCount"`
	TotalTokenCount      int `json:"totalTokenCount"`
}

type GeminiResponse struct {
	Candidates    []Candidate    `json:"candidates,omitempty"`
	UsageMetadata *UsageMetadata `json:"usageMetadata,omitempty"`
	Error         *APIError      `json:"error,omitempty"`
}

type GeminiClient interface {
	Generate(ctx context.Context, systemPrompt string, contents []Content, jsonOutput bool, customKey ...string) (string, int, error)
	StreamGenerate(ctx context.Context, systemPrompt string, contents []Content, onChunk func(chunk string) error, customKey ...string) (int, error)
	ValidateKey(ctx context.Context, apiKey string) error
}

type geminiClient struct {
	apiKey     string
	model      string
	httpClient *http.Client
}

func NewGeminiClient(apiKey string, primaryModel ...string) GeminiClient {
	model := DefaultGeminiModel
	if len(primaryModel) > 0 && primaryModel[0] != "" {
		model = primaryModel[0]
	}
	return &geminiClient{
		apiKey: apiKey,
		model:  model,
		httpClient: &http.Client{
			Timeout: 120 * time.Second, // Timeout amplio para análisis de PDFs extensos
		},
	}
}

func (c *geminiClient) getCandidateModels() []string {
	defaults := []string{c.model, "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"}
	seen := make(map[string]bool)
	var list []string
	for _, m := range defaults {
		if m != "" && !seen[m] {
			seen[m] = true
			list = append(list, m)
		}
	}
	return list
}

func isTransient(code int, status string) bool {
	return code == http.StatusServiceUnavailable || // 503
		code == http.StatusTooManyRequests || // 429
		code == http.StatusGatewayTimeout || // 504
		status == "UNAVAILABLE" ||
		status == "RESOURCE_EXHAUSTED"
}

func (c *geminiClient) Generate(ctx context.Context, systemPrompt string, contents []Content, jsonOutput bool, customKey ...string) (string, int, error) {
	effectiveApiKey := c.apiKey
	if len(customKey) > 0 && strings.TrimSpace(customKey[0]) != "" {
		effectiveApiKey = strings.TrimSpace(customKey[0])
	}
	if effectiveApiKey == "" {
		return "", 0, fmt.Errorf("GEMINI_KEY_REQUIRED: No se encontró una clave de Gemini configurada. Por favor, configura tu API Key.")
	}

	reqPayload := GeminiRequest{
		Contents: contents,
	}

	if systemPrompt != "" {
		reqPayload.SystemInstruction = &SystemInstruction{
			Parts: []Part{{Text: systemPrompt}},
		}
	}

	genConfig := &GenerationConfig{
		Temperature: 0.2, // Respuestas certeras y fidedignas al material académico
	}
	if jsonOutput {
		genConfig.ResponseMimeType = "application/json"
	}
	reqPayload.GenerationConfig = genConfig

	bodyBytes, err := json.Marshal(reqPayload)
	if err != nil {
		return "", 0, fmt.Errorf("error al serializar payload de Gemini: %w", err)
	}

	models := c.getCandidateModels()
	var lastErr error

	for i, model := range models {
		url := fmt.Sprintf("%s/%s:generateContent?key=%s", GeminiAPIBaseURL, model, effectiveApiKey)
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(bodyBytes))
		if err != nil {
			return "", 0, fmt.Errorf("error al crear request HTTP: %w", err)
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = fmt.Errorf("error al comunicarse con Gemini API (%s): %w", model, err)
			if i < len(models)-1 {
				continue
			}
			return "", 0, lastErr
		}

		respBytes, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			lastErr = fmt.Errorf("error al leer respuesta de Gemini (%s): %w", model, err)
			if i < len(models)-1 {
				continue
			}
			return "", 0, lastErr
		}

		var geminiResp GeminiResponse
		if err := json.Unmarshal(respBytes, &geminiResp); err != nil {
			lastErr = fmt.Errorf("error al decodificar respuesta JSON (%s): %w (body: %s)", model, err, string(respBytes))
			if i < len(models)-1 {
				continue
			}
			return "", 0, lastErr
		}

		if geminiResp.Error != nil {
			lastErr = fmt.Errorf("error de Gemini API (%s %d %s): %s", model, geminiResp.Error.Code, geminiResp.Error.Status, geminiResp.Error.Message)
			if isTransient(geminiResp.Error.Code, geminiResp.Error.Status) && i < len(models)-1 {
				log.Printf("⚠️ Gemini %s con sobrecarga temporal (%d). Reintentando con %s...", model, geminiResp.Error.Code, models[i+1])
				time.Sleep(300 * time.Millisecond)
				continue
			}
			return "", 0, lastErr
		}

		if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("Gemini (%s) no devolvió candidatos de respuesta", model)
			if i < len(models)-1 {
				continue
			}
			return "", 0, lastErr
		}

		text := geminiResp.Candidates[0].Content.Parts[0].Text
		totalTokens := 0
		if geminiResp.UsageMetadata != nil {
			totalTokens = geminiResp.UsageMetadata.TotalTokenCount
		}

		return text, totalTokens, nil
	}

	return "", 0, lastErr
}

func (c *geminiClient) StreamGenerate(ctx context.Context, systemPrompt string, contents []Content, onChunk func(chunk string) error, customKey ...string) (int, error) {
	effectiveApiKey := c.apiKey
	if len(customKey) > 0 && strings.TrimSpace(customKey[0]) != "" {
		effectiveApiKey = strings.TrimSpace(customKey[0])
	}
	if effectiveApiKey == "" {
		return 0, fmt.Errorf("GEMINI_KEY_REQUIRED: No se encontró una clave de Gemini configurada. Por favor, configura tu API Key.")
	}

	reqPayload := GeminiRequest{
		Contents: contents,
		GenerationConfig: &GenerationConfig{
			Temperature: 0.3,
		},
	}

	if systemPrompt != "" {
		reqPayload.SystemInstruction = &SystemInstruction{
			Parts: []Part{{Text: systemPrompt}},
		}
	}

	bodyBytes, err := json.Marshal(reqPayload)
	if err != nil {
		return 0, fmt.Errorf("error al serializar payload: %w", err)
	}

	models := c.getCandidateModels()
	var lastErr error

	for i, model := range models {
		url := fmt.Sprintf("%s/%s:streamGenerateContent?key=%s", GeminiAPIBaseURL, model, effectiveApiKey)
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(bodyBytes))
		if err != nil {
			return 0, fmt.Errorf("error al crear request HTTP: %w", err)
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = fmt.Errorf("error en llamada de streaming (%s): %w", model, err)
			if i < len(models)-1 {
				continue
			}
			return 0, lastErr
		}

		if isTransient(resp.StatusCode, "") && i < len(models)-1 {
			resp.Body.Close()
			log.Printf("⚠️ Streaming con Gemini %s no disponible (HTTP %d). Reintentando con %s...", model, resp.StatusCode, models[i+1])
			time.Sleep(300 * time.Millisecond)
			continue
		}

		if resp.StatusCode != http.StatusOK {
			b, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			lastErr = fmt.Errorf("error en streaming (HTTP %d): %s", resp.StatusCode, string(b))
			if i < len(models)-1 {
				time.Sleep(300 * time.Millisecond)
				continue
			}
			return 0, lastErr
		}

		// El stream entrega un JSON array o chunks delimitados
		decoder := json.NewDecoder(bufio.NewReader(resp.Body))
		totalTokens := 0
		hasSentChunk := false
		isStreamError := false

		token, err := decoder.Token()
		if err != nil {
			resp.Body.Close()
			lastErr = fmt.Errorf("error iniciando stream (%s): %w", model, err)
			if i < len(models)-1 {
				time.Sleep(300 * time.Millisecond)
				continue
			}
			return 0, lastErr
		}

		if delim, ok := token.(json.Delim); ok && delim == '[' {
			for decoder.More() {
				var chunk GeminiResponse
				if err := decoder.Decode(&chunk); err != nil {
					break
				}
				if chunk.Error != nil {
					lastErr = fmt.Errorf("error de Gemini (%d %s): %s", chunk.Error.Code, chunk.Error.Status, chunk.Error.Message)
					if isTransient(chunk.Error.Code, chunk.Error.Status) && !hasSentChunk && i < len(models)-1 {
						isStreamError = true
						break
					}
					resp.Body.Close()
					return totalTokens, lastErr
				}
				if chunk.UsageMetadata != nil {
					totalTokens = chunk.UsageMetadata.TotalTokenCount
				}
				for _, cand := range chunk.Candidates {
					for _, part := range cand.Content.Parts {
						if part.Text != "" {
							hasSentChunk = true
							if err := onChunk(part.Text); err != nil {
								resp.Body.Close()
								return totalTokens, err
							}
						}
					}
				}
			}
		} else {
			// Fallback si la respuesta no fue un array de chunks
			var single GeminiResponse
			if err := decoder.Decode(&single); err == nil {
				if single.Error != nil {
					lastErr = fmt.Errorf("error de Gemini (%d %s): %s", single.Error.Code, single.Error.Status, single.Error.Message)
					if isTransient(single.Error.Code, single.Error.Status) && !hasSentChunk && i < len(models)-1 {
						isStreamError = true
					} else {
						resp.Body.Close()
						return totalTokens, lastErr
					}
				} else {
					for _, cand := range single.Candidates {
						for _, part := range cand.Content.Parts {
							if part.Text != "" {
								hasSentChunk = true
								_ = onChunk(part.Text)
							}
						}
					}
				}
			}
		}

		resp.Body.Close()

		if isStreamError && !hasSentChunk && i < len(models)-1 {
			log.Printf("⚠️ Error transitorio en stream de %s. Reintentando con %s...", model, models[i+1])
			time.Sleep(300 * time.Millisecond)
			continue
		}

		return totalTokens, nil
	}

	return 0, lastErr
}

// Helper para convertir archivo binario a InlineData Base64
func FileToInlineData(data []byte, mimeType string) *InlineData {
	return &InlineData{
		MimeType: mimeType,
		Data:     base64.StdEncoding.EncodeToString(data),
	}
}

// Helper para limpiar bloques ```json ... ``` si el LLM los incluye
func CleanJSONResponse(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if strings.HasPrefix(trimmed, "```json") {
		trimmed = strings.TrimPrefix(trimmed, "```json")
		trimmed = strings.TrimSuffix(trimmed, "```")
	} else if strings.HasPrefix(trimmed, "```") {
		trimmed = strings.TrimPrefix(trimmed, "```")
		trimmed = strings.TrimSuffix(trimmed, "```")
	}
	return strings.TrimSpace(trimmed)
}

func (c *geminiClient) ValidateKey(ctx context.Context, apiKey string) error {
	trimmed := strings.TrimSpace(apiKey)
	if trimmed == "" {
		return fmt.Errorf("la API Key no puede estar vacía")
	}

	contents := []Content{
		{
			Role:  "user",
			Parts: []Part{{Text: "Responde únicamente 'OK'"}},
		},
	}

	_, _, err := c.Generate(ctx, "Eres un validador de conexión.", contents, false, trimmed)
	if err != nil {
		return fmt.Errorf("API Key inválida o sin acceso al modelo: %w", err)
	}
	return nil
}

