import React, { useState, useRef, useEffect } from 'react';
import styles from './AiCopilotPane.module.css';
import { Send, Square, Sparkles, Copy, Check, FileDown, Loader2 } from 'lucide-react';
import { aiService, type ChatMessage } from '../../../../services';
import { AiMarkdownRenderer } from './AiMarkdownRenderer';

interface AiChatTabProps {
  noteId?: string;
  noteTitle?: string;
  materiaId?: string;
  materialId?: string;
  materialTitle?: string;
  onInsertMarkdown?: (text: string) => void;
}

const SUGGESTIONS = [
  '¿Cuáles son los conceptos centrales de este contenido?',
  'Explicame las fórmulas y deducciones paso a paso',
  '¿Qué preguntas capciosas podrían tomar en el final?',
  'Dame un ejemplo práctico aplicado a un caso real'
];

export const AiChatTab: React.FC<AiChatTabProps> = ({
  noteId,
  noteTitle,
  materiaId,
  materialId,
  materialTitle,
  onInsertMarkdown
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: `¡Hola! Soy tu **Copiloto de Estudio**. ${
        materialTitle
          ? `Tengo cargado el documento **${materialTitle}** y tus notas.`
          : noteTitle
          ? `Estoy sincronizado con tu apunte **${noteTitle}**.`
          : 'Seleccioná un apunte o PDF para comenzar a estudiar juntos.'
      } ¿Qué querés repasar o resolver hoy?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [insertedIndex, setInsertedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input.trim();
    if (!textToSend || isStreaming) return;

    setInput('');
    isCancelledRef.current = false;

    // Add user message & empty placeholder for model response
    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: textToSend }];
    setMessages([...newHistory, { role: 'model', content: '' }]);
    setIsStreaming(true);

    let accumulatedResponse = '';

    try {
      await aiService.streamChat(
        {
          materia_id: materiaId,
          material_id: materialId,
          apunte_id: noteId,
          mensaje: textToSend,
          historial: messages.slice(-8) // keep recent context
        },
        chunk => {
          if (isCancelledRef.current) return;
          accumulatedResponse += chunk;
          setMessages(prev => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === 'model') {
              last.content = accumulatedResponse;
            }
            return copy;
          });
        },
        () => {
          setIsStreaming(false);
        },
        err => {
          console.error('Error en stream de chat:', err);
          setIsStreaming(false);
          setMessages(prev => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === 'model' && !accumulatedResponse) {
              last.content = `⚠️ Hubo un error al generar la respuesta: ${err.message || 'Error de conexión'}.`;
            }
            return copy;
          });
        }
      );
    } catch (err: any) {
      console.error('Error enviando chat:', err);
      setIsStreaming(false);
    }
  };

  const handleStop = () => {
    isCancelledRef.current = true;
    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleInsert = (content: string, index: number) => {
    if (onInsertMarkdown) {
      onInsertMarkdown(content);
      setInsertedIndex(index);
      setTimeout(() => setInsertedIndex(null), 2000);
    }
  };

  return (
    <div className={styles.chatContainer}>
      {/* Scrollable conversation */}
      <div className={styles.messagesList}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.messageBubble} ${
              msg.role === 'user' ? styles.userMessage : styles.modelMessage
            }`}
          >
            {msg.role === 'model' && (
              <div className={styles.modelMessageHeader}>
                <div className={styles.modelName}>
                  <Sparkles size={12} />
                  <span>Copiloto Gemini</span>
                </div>

                {msg.content && (
                  <div className={styles.modelMessageActions}>
                    <button
                      className={`${styles.actionPillBtn} ${
                        copiedIndex === idx ? styles.actionPillSuccess : ''
                      }`}
                      onClick={() => handleCopy(msg.content, idx)}
                      title="Copiar al portapapeles"
                    >
                      {copiedIndex === idx ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedIndex === idx ? 'Copiado' : 'Copiar'}</span>
                    </button>

                    {onInsertMarkdown && (
                      <button
                        className={`${styles.actionPillBtn} ${
                          insertedIndex === idx ? styles.actionPillSuccess : ''
                        }`}
                        onClick={() => handleInsert(msg.content, idx)}
                        title="Insertar respuesta en mi apunte abierto"
                      >
                        {insertedIndex === idx ? <Check size={11} /> : <FileDown size={11} />}
                        <span>{insertedIndex === idx ? 'Insertado' : 'Insertar en apunte'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {msg.role === 'user' ? (
              <div>{msg.content}</div>
            ) : (
              <div>
                <AiMarkdownRenderer content={msg.content} />
                {isStreaming && idx === messages.length - 1 && !msg.content && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', padding: '4px 0' }}>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Pensando y analizando material...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts chips */}
      {messages.length <= 3 && !isStreaming && (
        <div className={styles.suggestionsWrapper}>
          <div className={styles.suggestionsTitle}>Preguntas sugeridas</div>
          <div className={styles.suggestionsChips}>
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                className={styles.suggestionChip}
                onClick={() => handleSend(sug)}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Textarea & Send */}
      <div className={styles.chatInputArea}>
        <textarea
          className={styles.chatTextarea}
          placeholder="Escribí una pregunta sobre el apunte o el PDF... (Shift+Enter para nueva línea)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        {isStreaming ? (
          <button
            className={`${styles.sendBtn} ${styles.stopBtn}`}
            onClick={handleStop}
            title="Detener respuesta"
          >
            <Square size={14} />
          </button>
        ) : (
          <button
            className={styles.sendBtn}
            onClick={() => handleSend()}
            disabled={!input.trim()}
            title="Enviar mensaje (Enter)"
          >
            <Send size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AiChatTab;
