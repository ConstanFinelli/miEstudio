package ai

import (
	"bufio"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const (
	DefaultGeminiModel = "gemini-3.6-flash"
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
	Temperature      float64 `json:"temperature,omitempty"`
	ResponseMimeType string  `json:"responseMimeType,omitempty"`
}

type GeminiRequest struct {
	SystemInstruction *SystemInstruction `json:"system_instruction,omitempty"`
	Contents          []Content          `json:"contents"`
	GenerationConfig  *GenerationConfig  `json:"generationConfig,omitempty"`
}

type CandidatePart struct {
	Text string `json:"text"`
}

type CandidateContent struct {
	Role  string          `json:"role"`
	Parts []CandidatePart `json:"parts"`
}

type Candidate struct {
	Content      CandidateContent `json:"content"`
	FinishReason string           `json:"finishReason"`
}

type UsageMetadata struct {
	TotalTokenCount int `json:"totalTokenCount"`
}

type GeminiResponse struct {
	Candidates    []Candidate    `json:"candidates"`
	UsageMetadata *UsageMetadata `json:"usageMetadata"`
	Error         *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Status  string `json:"status"`
	} `json:"error,omitempty"`
}

type GeminiClient interface {
	Generate(ctx context.Context, systemPrompt string, contents []Content, jsonOutput bool) (string, int, error)
	StreamGenerate(ctx context.Context, systemPrompt string, contents []Content, onChunk func(chunk string) error) (int, error)
}

type geminiClient struct {
	apiKey     string
	model      string
	httpClient *http.Client
}

func NewGeminiClient(apiKey string) GeminiClient {
	return &geminiClient{
		apiKey: apiKey,
		model:  DefaultGeminiModel,
		httpClient: &http.Client{
			Timeout: 120 * time.Second, // Timeout amplio para análisis de PDFs extensos
		},
	}
}

func (c *geminiClient) Generate(ctx context.Context, systemPrompt string, contents []Content, jsonOutput bool) (string, int, error) {
	if c.apiKey == "" {
		return "", 0, fmt.Errorf("GEMINI_API_KEY no está configurada")
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

	url := fmt.Sprintf("%s/%s:generateContent?key=%s", GeminiAPIBaseURL, c.model, c.apiKey)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return "", 0, fmt.Errorf("error al crear request HTTP: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", 0, fmt.Errorf("error al comunicarse con Gemini API: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", 0, fmt.Errorf("error al leer respuesta de Gemini: %w", err)
	}

	var geminiResp GeminiResponse
	if err := json.Unmarshal(respBytes, &geminiResp); err != nil {
		return "", 0, fmt.Errorf("error al decodificar respuesta JSON: %w (body: %s)", err, string(respBytes))
	}

	if geminiResp.Error != nil {
		return "", 0, fmt.Errorf("error de Gemini API (%d %s): %s", geminiResp.Error.Code, geminiResp.Error.Status, geminiResp.Error.Message)
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return "", 0, fmt.Errorf("Gemini no devolvió candidatos de respuesta")
	}

	text := geminiResp.Candidates[0].Content.Parts[0].Text
	totalTokens := 0
	if geminiResp.UsageMetadata != nil {
		totalTokens = geminiResp.UsageMetadata.TotalTokenCount
	}

	return text, totalTokens, nil
}

func (c *geminiClient) StreamGenerate(ctx context.Context, systemPrompt string, contents []Content, onChunk func(chunk string) error) (int, error) {
	if c.apiKey == "" {
		return 0, fmt.Errorf("GEMINI_API_KEY no está configurada")
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

	url := fmt.Sprintf("%s/%s:streamGenerateContent?key=%s", GeminiAPIBaseURL, c.model, c.apiKey)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return 0, fmt.Errorf("error al crear request HTTP: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return 0, fmt.Errorf("error en llamada de streaming: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return 0, fmt.Errorf("error en streaming (HTTP %d): %s", resp.StatusCode, string(b))
	}

	// El stream entrega un JSON array o chunks delimitados
	decoder := json.NewDecoder(bufio.NewReader(resp.Body))
	totalTokens := 0

	// Leer primer token '[' del array si existe
	token, err := decoder.Token()
	if err != nil {
		return 0, fmt.Errorf("error iniciando stream: %w", err)
	}

	if delim, ok := token.(json.Delim); ok && delim == '[' {
		for decoder.More() {
			var chunk GeminiResponse
			if err := decoder.Decode(&chunk); err != nil {
				break
			}
			if chunk.UsageMetadata != nil {
				totalTokens = chunk.UsageMetadata.TotalTokenCount
			}
			for _, cand := range chunk.Candidates {
				for _, part := range cand.Content.Parts {
					if part.Text != "" {
						if err := onChunk(part.Text); err != nil {
							return totalTokens, err
						}
					}
				}
			}
		}
	} else {
		// Fallback si no fue array
		var single GeminiResponse
		if err := json.Unmarshal(bodyBytes, &single); err == nil {
			for _, cand := range single.Candidates {
				for _, part := range cand.Content.Parts {
					if part.Text != "" {
						_ = onChunk(part.Text)
					}
				}
			}
		}
	}

	return totalTokens, nil
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
