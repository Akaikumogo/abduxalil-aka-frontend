import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatApi } from '../../services/api';

const POLL_INTERVAL = 3000;

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [operatorInfo, setOperatorInfo] = useState(null);
  const [quickReplies, setQuickReplies] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load operator info and quick replies
  useEffect(() => {
    const loadSettings = async () => {
      const [operator, replies] = await Promise.all([
        chatApi.getOperatorInfo(),
        chatApi.getQuickReplies(),
      ]);
      if (operator) setOperatorInfo(operator);
      if (replies) setQuickReplies(replies);
    };
    loadSettings();
  }, []);

  // Fetch all messages (full refresh approach)
  const fetchMessages = useCallback(async () => {
    try {
      const response = await chatApi.getMessages();
      if (response.success && response.messages) {
        const sortedMessages = response.messages.sort(
          (a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
        );
        
        // Check for new operator messages
        if (!isOpen) {
          const currentIds = new Set(messages.map(m => m.id));
          const newOperatorMessages = sortedMessages.filter(
            m => !m.isUser && !currentIds.has(m.id)
          );
          if (newOperatorMessages.length > 0) {
            setUnreadCount(prev => prev + newOperatorMessages.length);
          }
        }
        
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [isOpen, messages]);

  // Start/stop polling
  useEffect(() => {
    // Initial fetch
    fetchMessages();
    
    // Set up polling
    pollIntervalRef.current = setInterval(fetchMessages, POLL_INTERVAL);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Clear unread when opening
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Optimistic update
    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await chatApi.sendMessage(messageText);
      if (response.success) {
        // Refresh messages to get the real message with ID
        await fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (text) => {
    setInputValue(text);
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        className="chat-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open chat"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" />
            </motion.svg>
          )}
        </AnimatePresence>
        {unreadCount > 0 && !isOpen && (
          <motion.span 
            className="chat-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chat-window active"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="chat-header">
              <button className="chat-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="chat-header-info">
                <div className="chat-operator">
                  <span className="chat-operator-name">
                    {operatorInfo?.name || 'Operator Safia'}
                  </span>
                  <span className="chat-status-dot"></span>
                </div>
                <div className="chat-operator-role">
                  {operatorInfo?.role || 'Operator'}
                </div>
                {operatorInfo?.telegram && (
                  <div className="chat-operator-telegram">{operatorInfo.telegram}</div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {/* Welcome message */}
              <motion.div 
                className="chat-message chat-message-operator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="chat-message-content">
                  <p>Salom! Qanday yordam bera olaman?</p>
                  <span className="chat-message-time">{formatTime(new Date())}</span>
                </div>
              </motion.div>

              {/* User messages */}
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`chat-message ${message.isUser ? 'chat-message-user' : 'chat-message-operator'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="chat-message-content">
                    <p>{message.text}</p>
                    <div className="chat-message-footer">
                      <span className="chat-message-time">
                        {formatTime(message.timestamp || message.createdAt)}
                      </span>
                      {message.isUser && (
                        <span className={message.isRead ? 'message-read-icon' : 'message-sent-icon'}>
                          {message.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {Object.keys(quickReplies).length > 0 && messages.length < 2 && (
              <motion.div 
                className="quick-reply-suggestions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {Object.entries(quickReplies).slice(0, 4).map(([key, value]) => (
                  <motion.button
                    key={key}
                    className="quick-reply-suggestion-btn"
                    onClick={() => handleQuickReply(value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {key}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Input */}
            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Xabar yozing..."
                disabled={isLoading}
              />
              <motion.button
                className="chat-send"
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Send message"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatWidget;
