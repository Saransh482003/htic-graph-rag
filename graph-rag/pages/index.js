import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { COLORS, FONTS, SPACING, SAMPLE_QUESTIONS, LOADING_MESSAGES, BASE_API_URL, API_ENDPOINTS } from '../constants';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your Biomedical Knowledge Assistant. I can help you with questions about medical devices, clinical procedures, and health information from our comprehensive knowledge base. How can I assist you today?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [expandedRefs, setExpandedRefs] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setShowSidebar(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSampleQuestion = (question) => {
    setInputValue(question);
    inputRef.current?.focus();
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const resetConversation = () => {
    setConversationId(null);
    setExpandedRefs({});
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: "Hello! I'm your Biomedical Knowledge Assistant. I can help you with questions about medical devices, clinical procedures, and health information from our comprehensive knowledge base. How can I assist you today?",
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  const toggleReferences = (messageId) => {
    setExpandedRefs((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate loading messages
    let messageIndex = 0;
    const loadingInterval = setInterval(() => {
      setLoadingMessage(LOADING_MESSAGES[messageIndex % LOADING_MESSAGES.length]);
      messageIndex++;
    }, 1000);

    try {
      // Determine if this is a follow-up question or initial question
      const isFollowUp = conversationId !== null;
      const endpoint = isFollowUp ? API_ENDPOINTS.followup : API_ENDPOINTS.chat;
      
      const requestBody = {
        question: userMessage.content,
        ...(isFollowUp && { conversation_id: conversationId })
      };

      const response = await fetch(`${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      clearInterval(loadingInterval);
      setLoadingMessage('');

      // Store conversation ID for follow-up questions
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.answer,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: data.processing_time,
          conversationId: data.conversation_id,
          isFollowUp: isFollowUp,
          entitiesUsed: data.entities_used,
          retrievals: Array.isArray(data.retrievals) ? data.retrievals : [],
          contextSummary: data.context_summary,
        }
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      clearInterval(loadingInterval);
      setLoadingMessage('');
      
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I apologize, but I'm having trouble processing your request right now. Please ensure the backend server is running and try again later.",
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>HTIC Biomedical Knowledge Assistant</title>
        <meta name="description" content="Advanced biomedical knowledge assistant powered by Graph RAG technology" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={styles.container}>
        {/* Background Pattern */}
        <div style={styles.backgroundPattern}></div>
        
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.logo}>
              <div 
                style={styles.logoIcon}
                onMouseEnter={(e) => {
                  e.target.style.animation = 'heartbeat 0.6s ease-in-out 3';
                }}
                onMouseLeave={(e) => {
                  e.target.style.animation = 'none';
                }}
              >
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill={COLORS.primary.orange}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <div>
                <h1 style={styles.logoTitle}>HTIC Medical Assistant</h1>
                <p style={styles.logoSubtitle}>Powered by Graph RAG Technology</p>
              </div>
            </div>
            <div style={styles.headerStats}>
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  style={styles.mobileMenuButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = COLORS.primary.lightGray;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = COLORS.primary.mediumGray;
                  }}
                >
                  ☰
                </button>
              )}
              {conversationId && (
                <button
                  onClick={resetConversation}
                  style={styles.resetButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = COLORS.primary.lightGray;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = COLORS.primary.mediumGray;
                  }}
                  title="Start new conversation"
                >
                  🔄
                </button>
              )}
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{messages.filter(m => m.type === 'user').length}</span>
                <span style={styles.statLabel}>Questions</span>
              </div>
            </div>
          </div>
        </header>

        <main style={styles.main}>
          <div style={styles.layout}>
            {/* Sidebar with sample questions */}
            {(!isMobile || showSidebar) && (
              <aside style={{
                ...styles.sidebar,
                ...(isMobile ? styles.sidebarMobile : {}),
                ...(showSidebar ? styles.sidebarVisible : {})
              }}>
                {isMobile && (
                  <div style={styles.sidebarHeader}>
                    <h3 style={styles.sidebarTitle}>Sample Questions</h3>
                    <button
                      onClick={toggleSidebar}
                      style={styles.closeSidebarButton}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = COLORS.primary.lightGray;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div style={styles.sidebarContent}>
                  {!isMobile && <h3 style={styles.sidebarTitle}>Sample Questions</h3>}
                  <div style={styles.questionsList}>
                    {SAMPLE_QUESTIONS.map((question) => (
                      <button
                        key={question.id}
                        onClick={() => handleSampleQuestion(question.text)}
                        style={styles.questionButton}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = COLORS.primary.lightGray;
                          e.target.style.borderColor = COLORS.primary.orange;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = COLORS.primary.mediumGray;
                          e.target.style.borderColor = 'transparent';
                        }}
                      >
                        <span style={styles.questionCategory}>{question.category}</span>
                        <span style={styles.questionText}>{question.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            )}

            {/* Chat Area */}
            <div style={{
              ...styles.chatContainer,
              ...(isMobile ? styles.chatContainerMobile : {})
            }}>
              <div style={styles.messagesContainer}>
                {messages.map((message) => (
                  <div key={message.id} style={styles.messageWrapper} className="message-enter">
                    <div style={{
                      ...styles.message,
                      ...(message.type === 'user' ? styles.userMessage : styles.botMessage),
                      ...(message.isError ? styles.errorMessage : {}),
                      ...(isMobile ? styles.messageMobile : {})
                    }}>
                      <div style={styles.messageHeader}>
                        <span style={styles.messageAvatar}>
                          {message.type === 'user' ? '👤' : '🤖'}
                        </span>
                        <span style={styles.messageSender}>
                          {message.type === 'user' ? 'You' : 'Medical Assistant'}
                        </span>
                        <span style={styles.messageTime}>
                          {isClient ? new Date(message.timestamp).toLocaleTimeString('en-US', { 
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          }) : ''}
                        </span>
                      </div>
                      <div style={styles.messageContent}>
                        {message.content}
                      </div>
                      {message.metadata && (
                        <div style={styles.messageMetadata}>
                          <span>⏱️ {message.metadata.processingTime}s</span>
                          {message.metadata.conversationId && (
                            <span>💬 {message.metadata.isFollowUp ? 'Follow-up' : 'Initial'}</span>
                          )}
                        </div>
                      )}

                      {/* References dropdown - only for bot messages with retrievals */}
                      {message.type === 'bot' && message.metadata?.retrievals?.length > 0 && (
                        <div style={styles.referencesSection}>
                          <button
                            type="button"
                            onClick={() => toggleReferences(message.id)}
                            style={{
                              ...styles.referencesToggle,
                              ...(expandedRefs[message.id] ? styles.referencesToggleExpanded : {})
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary.lightGray)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary.mediumGray)}
                          >
                            <span>📚 Show references</span>
                            <span style={styles.toggleIcon}>{expandedRefs[message.id] ? '▲' : '▼'}</span>
                          </button>

                          {expandedRefs[message.id] && (
                            <div style={styles.referencesContent}>
                              {message.metadata.retrievals.map((ret, idx) => (
                                <div key={idx} style={styles.referenceItem}>
                                  <div style={styles.referenceHeader}>
                                    <span style={styles.entityPill}>🔗 {ret.entity}</span>
                                  </div>
                                  {Array.isArray(ret.neighbors) && ret.neighbors.length > 0 && (
                                    <div style={styles.referenceBlock}>
                                      <div style={styles.referenceBlockTitle}>Triplets</div>
                                      <div style={styles.tripletList}>
                                        {ret.neighbors.slice(0, 5).map((n, i) => (
                                          <div key={i} style={styles.tripletRow}>
                                            <span style={styles.tripletPart}>{n.source}</span>
                                            <span style={styles.tripletRel}>{n.relation}</span>
                                            <span style={styles.tripletPart}>{n.target}</span>
                                            {n.provenance && (
                                              <span style={styles.tripletProv}>({n.provenance})</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {Array.isArray(ret.chunks) && ret.chunks.length > 0 && (
                                    <div style={styles.referenceBlock}>
                                      <div style={styles.referenceBlockTitle}>Source chunks</div>
                                      <div style={styles.chunkList}>
                                        {ret.chunks.map((c, j) => (
                                          <div key={j} style={styles.chunkCard}>
                                            <div style={styles.chunkHeader}>
                                              <span style={styles.chunkId}>Chunk {c.chunk_id}</span>
                                              <span style={styles.chunkSource}>📄 {c.source}</span>
                                            </div>
                                            <div style={styles.chunkText}>
                                              {c.text && c.text.length > 220 ? `${c.text.slice(0, 220)}…` : c.text}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div style={styles.messageWrapper} className="message-enter">
                    <div style={{
                      ...styles.message, 
                      ...styles.botMessage, 
                      ...styles.loadingMessage,
                      ...(isMobile ? styles.messageMobile : {})
                    }}>
                      <div style={styles.messageHeader}>
                        <span style={styles.messageAvatar}>🤖</span>
                        <span style={styles.messageSender}>Medical Assistant</span>
                      </div>
                      <div style={styles.messageContent}>
                        <div style={styles.loadingDots} className="loading-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span style={styles.loadingText}>{loadingMessage}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} style={styles.inputForm}>
                <div style={styles.inputContainer}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isMobile ? "Ask me anything..." : "Ask me about medical devices, procedures, or health information..."}
                    style={{
                      ...styles.input,
                      ...(isMobile ? styles.inputMobile : {})
                    }}
                    disabled={isLoading}
                    maxLength={1000}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    style={{
                      ...styles.sendButton,
                      ...((!inputValue.trim() || isLoading) ? styles.sendButtonDisabled : {})
                    }}
                    onMouseEnter={(e) => {
                      if (!e.target.disabled) {
                        e.target.style.backgroundColor = COLORS.primary.orangeLight;
                        e.target.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.target.disabled) {
                        e.target.style.backgroundColor = COLORS.primary.orange;
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {isLoading ? '⏳' : '➤'}
                  </button>
                </div>
                <div style={styles.inputMeta}>
                  <span style={styles.inputCounter}>
                    {inputValue.length}/1000
                  </span>
                  <span style={styles.inputHint}>
                    {isMobile ? "Tap to send" : "Press Enter to send"}
                  </span>
                </div>
              </form>
            </div>

            {/* Mobile overlay */}
            {isMobile && showSidebar && (
              <div 
                style={styles.mobileOverlay}
                onClick={toggleSidebar}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: COLORS.background.primary,
    fontFamily: FONTS.primary.family,
    color: COLORS.text.primary,
    position: 'relative',
    overflow: 'hidden',
  },

  backgroundPattern: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 25% 25%, ${COLORS.primary.mediumGray}20 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, ${COLORS.primary.lightGray}15 0%, transparent 50%),
      linear-gradient(135deg, ${COLORS.primary.darkGray} 0%, ${COLORS.primary.black} 100%)
    `,
    zIndex: -1,
  },

  header: {
    borderBottom: `1px solid ${COLORS.primary.mediumGray}`,
    backgroundColor: `${COLORS.background.card}dd`,
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },

  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: `${SPACING.lg} ${SPACING.xl}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.lg,
  },

  logoIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${COLORS.primary.darkGray}, ${COLORS.primary.black})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: COLORS.shadows.orange,
    border: `2px solid ${COLORS.primary.orange}20`,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  logoTitle: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.primary.weights.bold,
    margin: 0,
    background: `linear-gradient(135deg, ${COLORS.primary.white}, ${COLORS.text.secondary})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  logoSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.muted,
    margin: 0,
    fontWeight: FONTS.primary.weights.medium,
  },

  headerStats: {
    display: 'flex',
    gap: SPACING.lg,
    alignItems: 'center',
  },

  mobileMenuButton: {
    padding: SPACING.md,
    backgroundColor: COLORS.primary.mediumGray,
    border: 'none',
    borderRadius: '8px',
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.lg,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontFamily: 'inherit',
  },

  resetButton: {
    padding: SPACING.md,
    backgroundColor: COLORS.primary.mediumGray,
    border: 'none',
    borderRadius: '8px',
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.lg,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontFamily: 'inherit',
  },

  statItem: {
    textAlign: 'center',
    padding: SPACING.md,
    borderRadius: '8px',
    backgroundColor: COLORS.primary.mediumGray,
    minWidth: '80px',
  },

  statNumber: {
    display: 'block',
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.primary.weights.bold,
    color: COLORS.primary.orange,
  },

  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.muted,
    textTransform: 'uppercase',
    fontWeight: FONTS.primary.weights.medium,
  },

  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    height: 'calc(100vh - 80px)',
  },

  layout: {
    display: 'flex',
    height: '100%',
  },

  sidebar: {
    width: '300px',
    borderRight: `1px solid ${COLORS.primary.mediumGray}`,
    backgroundColor: `${COLORS.background.secondary}80`,
    backdropFilter: 'blur(5px)',
    position: 'relative',
    zIndex: 10,
  },

  sidebarMobile: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '80%',
    maxWidth: '300px',
    height: '100vh',
    backgroundColor: COLORS.background.secondary,
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease',
    zIndex: 1000,
    borderRight: `1px solid ${COLORS.primary.mediumGray}`,
  },

  sidebarVisible: {
    transform: 'translateX(0)',
  },

  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottom: `1px solid ${COLORS.primary.mediumGray}`,
  },

  closeSidebarButton: {
    padding: SPACING.sm,
    backgroundColor: 'transparent',
    border: 'none',
    color: COLORS.text.muted,
    fontSize: FONTS.sizes.lg,
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
  },

  sidebarContent: {
    padding: SPACING.xl,
    height: '100%',
    overflowY: 'auto',
  },

  sidebarTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.primary.weights.semibold,
    marginBottom: SPACING.xl,
    color: COLORS.primary.orange,
  },

  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.md,
  },

  questionButton: {
    backgroundColor: COLORS.primary.mediumGray,
    border: '1px solid transparent',
    borderRadius: '12px',
    padding: SPACING.lg,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: COLORS.text.primary,
    fontFamily: 'inherit',
  },

  questionCategory: {
    display: 'block',
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary.orange,
    fontWeight: FONTS.primary.weights.medium,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },

  questionText: {
    display: 'block',
    fontSize: FONTS.sizes.sm,
    lineHeight: FONTS.lineHeights.relaxed,
  },

  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  chatContainerMobile: {
    width: '100%',
  },

  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: SPACING.xl,
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.lg,
  },

  messageWrapper: {
    display: 'flex',
    width: '100%',
  },

  message: {
    maxWidth: '80%',
    padding: SPACING.lg,
    borderRadius: '16px',
    position: 'relative',
  },

  messageMobile: {
    maxWidth: '95%',
    padding: SPACING.md,
  },

  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary.orange,
    color: COLORS.text.primary,
    marginLeft: 'auto',
  },

  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background.card,
    border: `1px solid ${COLORS.primary.mediumGray}`,
    color: COLORS.text.primary,
  },

  errorMessage: {
    backgroundColor: `${COLORS.semantic.error}20`,
    borderColor: COLORS.semantic.error,
  },

  loadingMessage: {
    backgroundColor: `${COLORS.primary.orange}20`,
    borderColor: COLORS.primary.orange,
  },

  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    fontSize: FONTS.sizes.sm,
  },

  messageAvatar: {
    fontSize: FONTS.sizes.lg,
  },

  messageSender: {
    fontWeight: FONTS.primary.weights.semibold,
    color: COLORS.primary.orange,
  },

  messageTime: {
    color: COLORS.text.muted,
    marginLeft: 'auto',
    fontSize: FONTS.sizes.xs,
  },

  messageContent: {
    lineHeight: FONTS.lineHeights.relaxed,
    fontSize: FONTS.sizes.base,
  },

  messageMetadata: {
    marginTop: SPACING.md,
    display: 'flex',
    gap: SPACING.lg,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.muted,
  },

  loadingDots: {
    display: 'inline-flex',
    gap: '4px',
    marginRight: SPACING.sm,
    alignItems: 'center',
  },

  loadingText: {
    color: COLORS.text.muted,
    fontStyle: 'italic',
  },

  inputForm: {
    padding: SPACING.xl,
    borderTop: `1px solid ${COLORS.primary.mediumGray}`,
    backgroundColor: `${COLORS.background.secondary}80`,
    backdropFilter: 'blur(10px)',
  },

  inputContainer: {
    display: 'flex',
    gap: SPACING.md,
    alignItems: 'flex-end',
  },

  input: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: '12px',
    border: `2px solid ${COLORS.primary.mediumGray}`,
    backgroundColor: COLORS.background.card,
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.base,
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },

  inputMobile: {
    fontSize: FONTS.sizes.sm,
    padding: SPACING.md,
  },

  sendButton: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary.orange,
    border: 'none',
    borderRadius: '12px',
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.lg,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: COLORS.shadows.orange,
  },

  sendButtonDisabled: {
    backgroundColor: COLORS.interactive.disabled,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },

  inputMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.muted,
  },

  inputCounter: {
    color: COLORS.text.muted,
  },

  inputHint: {
    color: COLORS.text.muted,
  },

  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  // References UI styles
  referencesSection: {
    marginTop: SPACING.md,
    borderTop: `1px solid ${COLORS.primary.mediumGray}`,
    paddingTop: SPACING.md,
  },
  referencesToggle: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary.mediumGray,
    color: COLORS.text.primary,
    border: 'none',
    borderRadius: '8px',
    padding: `${SPACING.sm} ${SPACING.md}`,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: FONTS.sizes.sm,
    transition: 'background-color 0.2s ease',
  },
  referencesToggleExpanded: {
    boxShadow: COLORS.shadows.orange,
  },
  toggleIcon: {
    opacity: 0.8,
  },
  referencesContent: {
    marginTop: SPACING.md,
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.md,
  },
  referenceItem: {
    border: `1px solid ${COLORS.primary.mediumGray}`,
    borderRadius: '8px',
    padding: SPACING.md,
    backgroundColor: COLORS.background.card,
  },
  referenceHeader: {
    marginBottom: SPACING.sm,
  },
  entityPill: {
    display: 'inline-block',
    padding: `${SPACING.xs} ${SPACING.sm}`,
    borderRadius: '9999px',
    backgroundColor: `${COLORS.primary.orange}22`,
    color: COLORS.primary.orange,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.primary.weights.medium,
  },
  referenceBlock: {
    marginTop: SPACING.sm,
  },
  referenceBlockTitle: {
    color: COLORS.text.muted,
    fontSize: FONTS.sizes.xs,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tripletList: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  tripletRow: {
    display: 'flex',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: COLORS.primary.mediumGray,
    padding: `${SPACING.xs} ${SPACING.sm}`,
    borderRadius: '6px',
  },
  tripletPart: {
    color: COLORS.text.primary,
  },
  tripletRel: {
    color: COLORS.primary.orange,
    fontWeight: FONTS.primary.weights.medium,
  },
  tripletProv: {
    color: COLORS.text.muted,
    fontStyle: 'italic',
  },
  chunkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  chunkCard: {
    border: `1px solid ${COLORS.primary.mediumGray}`,
    borderRadius: '8px',
    padding: SPACING.sm,
    backgroundColor: COLORS.background.secondary,
  },
  chunkHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    color: COLORS.text.muted,
    fontSize: FONTS.sizes.xs,
    marginBottom: SPACING.xs,
  },
  chunkId: {
    color: COLORS.text.muted,
  },
  chunkSource: {
    color: COLORS.text.muted,
  },
  chunkText: {
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.sm,
    lineHeight: FONTS.lineHeights.relaxed,
  },
};
