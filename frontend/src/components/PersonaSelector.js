import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPersona, setShowNameModal } from '../store/uiSlice';
import './PersonaSelector.css';
import WavyBackground from './WavyBackground';

const PersonaSelector = () => {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(null);

  const handlePersonaSelect = (persona) => {
    setSelected(persona);
  };

  const handleContinue = () => {
    if (selected) {
      dispatch(setPersona(selected));
      if (selected === 'student') {
        dispatch(setShowNameModal(true));
      }
    }
  };

  return (
    <div className="landing-page">
      <WavyBackground />
      <main className="centered-page persona-main">
        <div className="persona-card">
          <div className="persona-badge">Intervue Poll</div>
          <h1 className="persona-heading">
            Welcome to the <span className="bold">Live Polling System</span>
          </h1>
          <div className="persona-subtitle">
            Please select the role that best describes you to begin using the live polling system
          </div>
          <div className="role-cards persona-role-cards">
            <div
              className={`role-card persona-role-card${selected === 'student' ? ' selected' : ''}`}
              tabIndex={0}
              onClick={() => handlePersonaSelect('student')}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePersonaSelect('student')}
              aria-label="I'm a Student"
            >
              <div className="role-card-title">I'm a Student</div>
              <div className="role-card-desc">
                Click this if you are a student.
              </div>
            </div>
            <div
              className={`role-card persona-role-card${selected === 'teacher' ? ' selected' : ''}`}
              tabIndex={0}
              onClick={() => handlePersonaSelect('teacher')}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePersonaSelect('teacher')}
              aria-label="I'm a Teacher"
            >
              <div className="role-card-title">I'm a Teacher</div>
              <div className="role-card-desc">
                Submit answers and view live poll results in real-time.
              </div>
            </div>
          </div>
          <button
            className="continue-button"
            onClick={handleContinue}
            disabled={!selected}
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  );
};

export default PersonaSelector; 