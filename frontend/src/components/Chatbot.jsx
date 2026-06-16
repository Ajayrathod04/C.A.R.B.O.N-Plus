import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Trash2, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import api from '../services/api';

const SUGGESTED_PROMPTS = [
  'How do I lower transport emissions?',
  'What are some simple home energy savings?',
  'How does diet impact carbon footprint?',
  'What waste items can be composted?'
];

/**
 * Sustainability Advisor interactive chatbot component.
 */
export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const chatEndRef = useRef(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('carbon_plus_chat_history');
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }, []);

  // Save chat history to localStorage when changed
  const saveHistory = (newMessages) => {
    setMessages(newMessages);
    try {
      localStorage.setItem('carbon_plus_chat_history', JSON.stringify(newMessages));
    } catch (err) {
      console.error('Failed to save chat history:', err);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = useCallback(async (textToSend) => {
    const query = textToSend.trim();
    if (!query) return;

    setError(null);
    setLoading(true);

    const userMsg = { id: Date.now() + '-user', sender: 'user', text: query };
    const updatedMessages = [...messages, userMsg];
    saveHistory(updatedMessages);
    setInputValue('');

    try {
      // Send message to backend Gemini assistant
      const response = await api.chat(query, messages);
      const botMsg = { id: Date.now() + '-bot', sender: 'bot', text: response };
      saveHistory([...updatedMessages, botMsg]);
    } catch (err) {
      setError('Failed to fetch advisor response. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const handleClear = () => {
    if (confirm('Clear chat history?')) {
      saveHistory([]);
      setError(null);
    }
  };

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: '480px', padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare style={{ color: 'var(--primary)' }} size={20} />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Sustainability Assistant</h3>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Interactive eco-advisor</span>
          </div>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={handleClear} 
            title="Clear Chat"
            style={{ 
              background: 'transparent', 
              color: 'var(--text-muted)', 
              padding: '6px', 
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Messages / Empty State */}
      <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px', marginBottom: '12px' }}>
        {messages.length === 0 ? (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
            <Sparkles size={36} style={{ color: 'var(--primary)', marginBottom: '12px', opacity: 0.8 }} />
            <h4 style={{ color: 'var(--text-main)', fontSize: '14px', marginBottom: '6px', fontWeight: 600 }}>Ask Me Anything about Green Living</h4>
            <p style={{ fontSize: '12px', lineHeight: 1.4, maxWidth: '280px', marginBottom: '16px' }}>
              Get answers about lowering emissions, saving water/electricity, composting, and eco-friendly shopping.
            </p>
            
            {/* Suggestions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '300px' }}>
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  style={{
                    fontSize: '11px',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'hsla(218, 25%, 12%, 0.4)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              style={{ 
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                lineHeight: 1.4,
                whiteSpace: 'pre-line',
                background: msg.sender === 'user' ? 'var(--primary-glow)' : 'hsla(218, 25%, 15%, 0.6)',
                border: msg.sender === 'user' ? '1px solid hsla(142, 71%, 45%, 0.3)' : '1px solid var(--border-color)',
                color: 'var(--text-main)'
              }}
            >
              {msg.text}
            </div>
          ))
        )}

        {loading && (
          <div style={{ alignSelf: 'flex-start', background: 'hsla(218, 25%, 15%, 0.6)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thinking...</span>
          </div>
        )}

        {error && (
          <div style={{ alignSelf: 'center', background: 'hsla(350, 89%, 60%, 0.1)', border: '1px solid var(--danger)', padding: '8px 12px', borderRadius: '8px', color: 'var(--danger)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input row */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputValue);
        }}
        style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}
      >
        <Input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a sustainability question..."
          disabled={loading}
          style={{ flexGrow: 1, padding: '8px 12px', fontSize: '13px' }}
        />
        <Button 
          type="submit" 
          disabled={loading || !inputValue.trim()} 
          variant="primary"
          style={{ padding: '8px 14px' }}
        >
          <Send size={16} />
        </Button>
      </form>
    </Card>
  );
}
