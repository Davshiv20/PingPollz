import React from 'react';

const StudentList = ({ students, onKickStudent, isKicking }) => {
  if (students.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
        <p>No students connected yet</p>
      </div>
    );
  }

  return (
    <div>
      {students.map((student) => (
        <div key={student.id} className="student-item">
          <div className="student-name">
            <span style={{ marginRight: '8px' }}>👤</span>
            {student.name}
          </div>
          <button
            className="kick-button"
            onClick={() => onKickStudent(student.id)}
            disabled={isKicking}
            title={`Kick ${student.name} out of the session`}
          >
            {isKicking ? '...' : '🚪 Kick'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default StudentList; 