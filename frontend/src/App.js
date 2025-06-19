import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from './services/socket';
import {
  setCurrentPoll,
  updatePollResults,
  setTimeRemaining,
  pollEnded,
} from './store/pollSlice';
import { addStudent, removeStudent } from './store/studentSlice';
import { addMessage } from './store/chatSlice';
import PersonaSelector from './components/PersonaSelector';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import NameModal from './components/NameModal';
import ChatPopup from './components/ChatPopup';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { persona, showNameModal } = useSelector((state) => state.ui);
  const { currentStudent } = useSelector((state) => state.student);

  useEffect(() => {
    // Socket event listeners
    socket.on('poll_created', (poll) => {
      dispatch(setCurrentPoll(poll));
      queryClient.invalidateQueries(['currentPoll']);
    });

    socket.on('current_poll', (data) => {
      dispatch(setCurrentPoll(data.poll));
      dispatch(setTimeRemaining(data.time_remaining));
      queryClient.invalidateQueries(['currentPoll']);
    });

    socket.on('poll_results_updated', (data) => {
      dispatch(updatePollResults(data));
      queryClient.invalidateQueries(['currentPoll']);
    });

    socket.on('poll_ended', (data) => {
      dispatch(pollEnded(data));
      queryClient.invalidateQueries(['currentPoll']);
      queryClient.invalidateQueries(['polls']);
    });

    socket.on('student_joined', (data) => {
      dispatch(addStudent(data));
      queryClient.invalidateQueries(['students']);
    });

    socket.on('student_left', (data) => {
      dispatch(removeStudent(data));
      queryClient.invalidateQueries(['students']);
    });

    socket.on('chat_message', (message) => {
      dispatch(addMessage(message));
      queryClient.invalidateQueries(['chatMessages']);
    });

    // Cleanup
    return () => {
      socket.off('poll_created');
      socket.off('current_poll');
      socket.off('poll_results_updated');
      socket.off('poll_ended');
      socket.off('student_joined');
      socket.off('student_left');
      socket.off('chat_message');
    };
  }, [dispatch, queryClient]);

  if (!persona) {
    return <PersonaSelector />;
  }

  if (persona === 'student' && !currentStudent && showNameModal) {
    return <NameModal />;
  }

  return (
    <div className="App">
      <Routes>
        <Route
          path="/teacher"
          element={
            persona === 'teacher' ? (
              <TeacherDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/student"
          element={
            persona === 'student' ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to={`/${persona}`} replace />} />
      </Routes>
      <ChatPopup />
    </div>
  );
}

export default App; 