import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEndPoll, useStudents, useKickStudent } from '../hooks/useApi';
import { setPersona, toggleChat } from '../store/uiSlice';
import PollForm from './PollForm';
import PollResults from './PollResults';
import StudentList from './StudentList';
import PastPolls from './PastPolls';

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { currentPoll, isPollActive, pastPolls } = useSelector((state) => state.poll);
  const [showPastPolls, setShowPastPolls] = useState(false);

  // React Query hooks
  const { data: studentsData, isLoading: studentsLoading } = useStudents();
  const endPollMutation = useEndPoll();
  const kickStudentMutation = useKickStudent();

  const students = studentsData?.students || [];

  const handleEndPoll = async () => {
    try {
      await endPollMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to end poll:', error);
    }
  };

  const handleKickStudent = async (studentId) => {
    try {
      await kickStudentMutation.mutateAsync(studentId);
    } catch (error) {
      console.error('Failed to kick student:', error);
    }
  };

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <div className="logo">📊 Live Polling System</div>
          <div className="header-actions">
            <span style={{ color: '#666', marginRight: '20px' }}>
              👨‍🏫 Teacher Dashboard
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setShowPastPolls(!showPastPolls)}
            >
              📚 {showPastPolls ? 'Hide' : 'Show'} Past Polls
            </button>
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
        {showPastPolls ? (
          <PastPolls polls={pastPolls} onClose={() => setShowPastPolls(false)} />
        ) : (
          <div className="dashboard">
            <div className="main-content">
              {!isPollActive ? (
                <PollForm />
              ) : (
                <div className="poll-results">
                  <h2 style={{ marginBottom: '20px', color: '#333' }}>
                    📊 Live Poll Results
                  </h2>
                  <PollResults />
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                      className="btn btn-danger"
                      onClick={handleEndPoll}
                      disabled={endPollMutation.isLoading}
                    >
                      {endPollMutation.isLoading ? (
                        <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                      ) : (
                        '⏹️ End Poll'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="sidebar">
              <div className="student-list">
                <h3 style={{ marginBottom: '20px', color: '#333' }}>
                  👥 Connected Students ({students.length})
                </h3>
                {studentsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '10px', color: '#666' }}>Loading students...</p>
                  </div>
                ) : (
                  <StudentList
                    students={students}
                    onKickStudent={handleKickStudent}
                    isKicking={kickStudentMutation.isLoading}
                  />
                )}
              </div>

              {currentPoll && (
                <div className="card" style={{ marginTop: '20px' }}>
                  <h3 style={{ marginBottom: '15px', color: '#333' }}>
                    📝 Current Poll
                  </h3>
                  <p style={{ marginBottom: '10px', fontWeight: '500' }}>
                    {currentPoll.question}
                  </p>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <p>Options: {currentPoll.options.join(', ')}</p>
                    <p>Time limit: {currentPoll.maxTime} seconds</p>
                    <p>Status: {currentPoll.isActive ? '🟢 Active' : '🔴 Ended'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard; 