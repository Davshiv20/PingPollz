import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { submitAnswer } from '../store/pollSlice';
import { setPersona, toggleChat } from '../store/uiSlice';
import PollResults from './PollResults';
import Timer from './Timer';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { currentPoll, isPollActive, pollResults, timeRemaining } = useSelector((state) => state.poll);
  const { currentStudent } = useSelector((state) => state.student);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (currentPoll && currentPoll.answeredStudents) {
      setHasAnswered(currentPoll.answeredStudents.includes(currentStudent?.id));
    }
  }, [currentPoll, currentStudent]);

  useEffect(() => {
    if (timeRemaining <= 0 && isPollActive) {
      setShowResults(true);
    }
  }, [timeRemaining, isPollActive]);

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentStudent) return;

    try {
      await dispatch(submitAnswer({
        poll_id: currentPoll.id,
        student_id: currentStudent.id,
        answer: selectedAnswer
      })).unwrap();
      setHasAnswered(true);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleAnswerSelect = (answer) => {
    if (!hasAnswered && isPollActive) {
      setSelectedAnswer(answer);
    }
  };

  if (!currentStudent) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', margin: '100px auto', maxWidth: '400px' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '20px', color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <div className="logo">📊 Live Polling System</div>
          <div className="header-actions">
            <span style={{ color: '#666', marginRight: '20px' }}>
              👨‍🎓 Student: {currentStudent.name}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => dispatch(toggleChat())}
            >
              💬 Chat
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => dispatch(setPersona(null))}
            >
              🔄 Switch Role
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {!currentPoll ? (
            <div className="card" style={{ textAlign: 'center', margin: '100px auto' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
              <h2 style={{ marginBottom: '10px', color: '#333' }}>
                Waiting for a Poll
              </h2>
              <p style={{ color: '#666' }}>
                The teacher will start a poll soon. Stay tuned!
              </p>
            </div>
          ) : isPollActive && !showResults ? (
            <div className="poll-display">
              <h2 style={{ marginBottom: '20px', color: '#333' }}>
                📝 Current Poll
              </h2>
              
              <Timer timeRemaining={timeRemaining} />
              
              <div className="poll-question">
                {currentPoll.question}
              </div>
              
              <div className="poll-options">
                {currentPoll.options.map((option, index) => (
                  <div
                    key={index}
                    className={`poll-option ${selectedAnswer === option ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
              
              <button
                className="btn btn-primary"
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer || hasAnswered}
                style={{ minWidth: '200px' }}
              >
                {hasAnswered ? '✅ Answered' : '📤 Submit Answer'}
              </button>
            </div>
          ) : (
            <div className="poll-results">
              <h2 style={{ marginBottom: '20px', color: '#333' }}>
                📊 Poll Results
              </h2>
              
              {!isPollActive && (
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '20px',
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  color: '#666'
                }}>
                  <p>⏰ Poll has ended</p>
                </div>
              )}
              
              <PollResults />
              
              {!isPollActive && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <p style={{ color: '#666', marginBottom: '15px' }}>
                    Waiting for the next poll...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 