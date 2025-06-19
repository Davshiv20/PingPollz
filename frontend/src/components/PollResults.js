import React from 'react';
import { useSelector } from 'react-redux';

const PollResults = () => {
  const { pollResults, answeredCount, totalStudents, currentPoll } = useSelector((state) => state.poll);

  if (!currentPoll || Object.keys(pollResults).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
        <p>No results yet. Waiting for responses...</p>
      </div>
    );
  }

  const totalVotes = Object.values(pollResults).reduce((sum, count) => sum + count, 0);
  const maxVotes = Math.max(...Object.values(pollResults));

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>
          <strong>Total Votes:</strong> {totalVotes}
        </div>
        <div>
          <strong>Responses:</strong> {answeredCount} / {totalStudents}
        </div>
        <div>
          <strong>Participation:</strong> {totalStudents > 0 ? Math.round((answeredCount / totalStudents) * 100) : 0}%
        </div>
      </div>

      <div>
        {currentPoll.options.map((option, index) => {
          const votes = pollResults[option] || 0;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const barWidth = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;

          return (
            <div key={index} className="result-item">
              <div style={{ minWidth: '120px', fontWeight: '500' }}>
                {option}
              </div>
              <div className="result-bar">
                <div 
                  className="result-fill"
                  style={{ 
                    width: `${barWidth}%`,
                    background: votes === maxVotes && votes > 0 
                      ? 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                ></div>
              </div>
              <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: '500' }}>
                {votes} ({percentage}%)
              </div>
            </div>
          );
        })}
      </div>

      {totalVotes > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#e8f5e8', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#2d5a2d' }}>
            🏆 Winner: {(() => {
              const maxVotes = Math.max(...Object.values(pollResults));
              const winners = Object.entries(pollResults)
                .filter(([_, votes]) => votes === maxVotes)
                .map(([option, _]) => option);
              return winners.join(', ');
            })()}
          </strong>
        </div>
      )}
    </div>
  );
};

export default PollResults; 