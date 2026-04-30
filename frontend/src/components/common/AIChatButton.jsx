import React, { useState, useRef, useEffect } from 'react';
import './AIChatButton.css';

const AIChatButton = () => {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m ScholarX AI. Ask me anything about research papers, academic topics, or how to use this platform! 📚' }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Local demo-safe mock: no direct external API calls from browser code.
      await new Promise((resolve) => setTimeout(resolve, 500));
      const reply = 'AI chat is disabled in this demo build for security. Please use search and dashboard tools for workflow actions.';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`ai-float-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Open AI Chat"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.06L2 22l4.94-1.37A9.953 9.953 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-1 14H7v-2h4v2zm6 0h-4v-2h4v2zm0-4H7V8h10v4z"/>
          </svg>
        )}
      </button>

      {/* Chat Box */}
      <div className={`ai-chatbox ${open ? 'visible' : ''}`}>
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-left">
            <div className="ai-avatar">✦</div>
            <div>
              <div className="ai-chat-title">ScholarX AI</div>
              <div className="ai-chat-status">
                <span className="status-dot" /> Online
              </div>
            </div>
          </div>
          <button className="ai-close-btn" onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* Messages */}
        <div className="ai-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`ai-msg ${msg.role}`}>
              {msg.role === 'assistant' && <div className="ai-msg-avatar">✦</div>}
              <div className="ai-msg-bubble">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="ai-msg assistant">
              <div className="ai-msg-avatar">✦</div>
              <div className="ai-msg-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="ai-chat-input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about research topics..."
            rows={1}
            disabled={loading}
          />
          <button
            className="ai-send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default AIChatButton;
