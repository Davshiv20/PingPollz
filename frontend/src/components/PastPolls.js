import React from 'react';

const PastPolls = ({ polls, onClose }) => {
  if (polls.length === 0) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', margin: '50px auto', maxWidth: '600px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📚</div>
          <h2 style={{ marginBottom: '10px', color: '#333' }}>No Past Polls</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            No polls have been completed yet. Start creating polls to see results here!
          </p>
          <button className="btn btn-primary" onClick={onClose}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#333' }}>📚 Past Poll Results</h1>
        <button className="btn btn-secondary" onClick={onClose}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {polls.map((poll, index) => {
          const totalVotes = Object.values(poll.finalResults || {}).reduce((sum, count) => sum + count, 0);
          const maxVotes = Math.max(...Object.values(poll.finalResults || {}));

          return (
            <div key={index} className="card">
              <h3 style={{ marginBottom: '15px', color: '#333' }}>
                {poll.question}
              </h3>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '15px',
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                <span><strong>Time Limit:</strong> {poll.maxTime} seconds</span>
                <span><strong>Total Votes:</strong> {totalVotes}</span>
                <span><strong>Date:</strong> {new Date(poll.createdAt).toLocaleString()}</span>
              </div>

              <div>
                {poll.options.map((option, optionIndex) => {
                  const votes = poll.finalResults?.[option] || 0;
                  const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                  const barWidth = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;

                  return (
                    <div key={optionIndex} className="result-item">
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
                  marginTop: '15px', 
                  padding: '10px', 
                  background: '#e8f5e8', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <strong style={{ color: '#2d5a2d' }}>
                    🏆 Winner: {(() => {
                      const maxVotes = Math.max(...Object.values(poll.finalResults || {}));
                      const winners = Object.entries(poll.finalResults || {})
                        .filter(([_, votes]) => votes === maxVotes)
                        .map(([option, _]) => option);
                      return winners.join(', ');
                    })()}
                  </strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PastPolls; 