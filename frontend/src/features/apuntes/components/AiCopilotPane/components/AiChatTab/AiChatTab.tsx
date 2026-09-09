import React, { useState, useRef, useEffect } from 'react';
import styles from './AiChatTab.module.css';
import { Send, Square, Sparkles, Copy, Check, FileDown, Loader2, RotateCcw } from 'lucide-react';
import { aiService, type ChatMessage } from '../../../../../../services';
import { AiMarkdownRenderer } from '../AiMarkdownRenderer';

interface AiChatTabProps {
  hasContext?: boolean;
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
  hasContext = true,
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
          ? `Tengo cargado el documento oficial **${materialTitle}**.`
          : 'Selecciona un documento PDF para comenzar a estudiar juntos.'
      } ¿Qué dudas o conceptos querés consultar sobre este material?`
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

  const handleClearChat = () => {
    setMessages([
      {
        role: 'model',
        content: `¡Conversación reiniciada! ¿Qué tema o duda querés consultar ahora?`
      }
    ]);
  };

  const handleSend = async (customMessage?: string) => {
    if (!hasContext) return;
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
      if (hasContext) {
        handleSend();
      }
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
      {/* Top Controls (Clear / New Conversation) */}
      {messages.length > 1 && !isStreaming && (
        <div className={styles.chatControlsRow}>
          <button
            type="button"
            className={styles.clearChatBtn}
            onClick={handleClearChat}
            title="Reiniciar chat y comenzar una nueva conversación"
          >
            <RotateCcw size={11} />
            <span>Nuevo tema / Limpiar chat</span>
          </button>
        </div>
      )}

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
                  <Sparkles
                    size={12}
                    className={isStreaming && idx === messages.length - 1 ? styles.spinPulse : ''}
                  />
                  <span>Copiloto Gemini</span>
                  {isStreaming && idx === messages.length - 1 && (
                    <span className={styles.streamingBadge}>
                      <Loader2 size={10} className="animate-spin" />
                      {msg.content ? 'Escribiendo...' : 'Pensando...'}
                    </span>
                  )}
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
                {isStreaming && idx === messages.length - 1 && !msg.content ? (
                  <div className={styles.thinkingContainer}>
                    <div className={styles.thinkingHeader}>
                      <div className={styles.thinkingIconPulse}>
                        <Sparkles size={12} />
                      </div>
                      <span className={styles.thinkingTitle}>El copiloto está pensando</span>
                      <span className={styles.thinkingDots}>
                        <span className={styles.dot} />
                        <span className={styles.dot} />
                        <span className={styles.dot} />
                      </span>
                    </div>
                    <div className={styles.thinkingDesc}>
                      Consultando material de estudio y razonando respuesta...
                    </div>
                    <div className={styles.skeletonBars}>
                      <div className={`${styles.skeletonBar} ${styles.skeletonBarLong}`} />
                      <div className={`${styles.skeletonBar} ${styles.skeletonBarShort}`} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.modelContentWrapper}>
                    <AiMarkdownRenderer content={msg.content} />
                    {isStreaming && idx === messages.length - 1 && (
                      <span className={styles.streamingCursor} />
                    )}
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
                disabled={!hasContext}
                title={hasContext ? undefined : "Se requiere contenido en el apunte o un PDF"}
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
          placeholder={
            hasContext
              ? "Escribí una pregunta sobre este material de estudio... (Shift+Enter para nueva línea)"
              : "Selecciona un material PDF arriba para comenzar a chatear..."
          }
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!hasContext}
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
            disabled={!hasContext || !input.trim()}
            title={hasContext ? "Enviar mensaje (Enter)" : "Se requiere un material PDF seleccionado"}
          >
            <Send size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AiChatTab;
