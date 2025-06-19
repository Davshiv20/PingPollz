import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendChatMessage } from '../store/chatSlice';
import { toggleChat } from '../store/uiSlice';

const ChatPopup = () => {
  const dispatch = useDispatch();
  const { showChat } = useSelector((state) => state.ui);
  const { messages } = useSelector((state) => state.chat);
  const { currentStudent } = useSelector((state) => state.student);
  const { persona } = useSelector((state) => state.ui);
  
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const senderName = persona === 'teacher' ? 'Teacher' : currentStudent?.name || 'Student';
    
    try {
      await dispatch(sendChatMessage({
        sender: senderName,
        message: message.trim(),
        sender_type: persona
      })).unwrap();
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!showChat) {
    return (
      <button
        className="chat-toggle-button"
        onClick={() => dispatch(toggleChat())}
        title="Open Chat"
      >
        💬
      </button>
    );
  }

  return (
    <div className="chat-popup">
      <div className="chat-header">
        <div className="chat-title">💬 Live Chat</div>
        <button
          className="chat-toggle"
          onClick={() => dispatch(toggleChat())}
          title="Close Chat"
        >
          ×
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            padding: '20px',
            fontSize: '14px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${
                msg.sender_type === persona ? 'sent' : 'received'
              }`}
            >
              <div style={{ 
                fontSize: '12px', 
                marginBottom: '4px',
                opacity: 0.8,
                fontWeight: '500'
              }}>
                {msg.sender}
              </div>
              <div>{msg.message}</div>
              <div style={{ 
                fontSize: '10px', 
                marginTop: '4px',
                opacity: 0.6
              }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={!currentStudent && persona === 'student'}
        />
        <button
          type="submit"
          className="chat-send"
          disabled={!message.trim() || (!currentStudent && persona === 'student')}
        >
          ➤
        </button>
      </form>
    </div>
  );
};

export default ChatPopup; 