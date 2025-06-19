import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { joinAsStudent } from '../store/studentSlice';
import { setShowNameModal } from '../store/uiSlice';

const NameModal = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const { loading, error: studentError } = useSelector((state) => state.student);

  useEffect(() => {
    // Check if student name is already stored in sessionStorage
    const storedName = sessionStorage.getItem('studentName');
    if (storedName) {
      setName(storedName);
      handleJoin(storedName);
    }
  }, []);

  const handleJoin = async (studentName) => {
    try {
      await dispatch(joinAsStudent(studentName)).unwrap();
      sessionStorage.setItem('studentName', studentName);
      dispatch(setShowNameModal(false));
    } catch (err) {
      setError(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    handleJoin(name.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in">
        <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>
          Welcome to the Polling Session! 👋
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="studentName">
              Enter your name:
            </label>
            <input
              id="studentName"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Your name"
              autoFocus
              disabled={loading}
            />
          </div>
          
          {(error || studentError) && (
            <div style={{ 
              color: '#ff6b6b', 
              marginBottom: '20px', 
              padding: '10px', 
              background: '#ffe6e6', 
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error || studentError}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !name.trim()}
              style={{ minWidth: '120px' }}
            >
              {loading ? (
                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
              ) : (
                'Join Session'
              )}
            </button>
          </div>
        </form>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666'
        }}>
          <p style={{ marginBottom: '8px' }}><strong>Note:</strong></p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Your name will be unique to this browser tab</li>
            <li>Opening a new tab will allow you to join as a different student</li>
            <li>Refreshing this tab will keep you logged in</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NameModal; 