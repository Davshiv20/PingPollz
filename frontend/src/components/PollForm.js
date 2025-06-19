import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPoll } from '../store/pollSlice';

const PollForm = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.poll);
  
  const [formData, setFormData] = useState({
    question: '',
    options: ['', ''],
    max_time: 60
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim()) {
      alert('Please enter a question');
      return;
    }

    const validOptions = formData.options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    try {
      await dispatch(createPoll({
        question: formData.question.trim(),
        options: validOptions,
        max_time: parseInt(formData.max_time)
      })).unwrap();
      
      // Reset form
      setFormData({
        question: '',
        options: ['', ''],
        max_time: 60
      });
    } catch (error) {
      console.error('Failed to create poll:', error);
    }
  };

  return (
    <div className="poll-form">
      <h2 style={{ marginBottom: '20px', color: '#333' }}>
        📝 Create New Poll
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="question">
            Question:
          </label>
          <input
            id="question"
            name="question"
            type="text"
            className="form-input"
            value={formData.question}
            onChange={handleInputChange}
            placeholder="Enter your question here..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Options:
          </label>
          {formData.options.map((option, index) => (
            <div key={index} className="option-input">
              <input
                type="text"
                className="form-input"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
              />
              {formData.options.length > 2 && (
                <button
                  type="button"
                  className="remove-option"
                  onClick={() => removeOption(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-option"
            onClick={addOption}
          >
            + Add Option
          </button>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="max_time">
            Time Limit (seconds):
          </label>
          <input
            id="max_time"
            name="max_time"
            type="number"
            className="form-input"
            value={formData.max_time}
            onChange={handleInputChange}
            min="10"
            max="300"
            required
          />
          <small style={{ color: '#666', fontSize: '14px' }}>
            Minimum 10 seconds, maximum 300 seconds (5 minutes)
          </small>
        </div>

        {error && (
          <div style={{ 
            color: '#ff6b6b', 
            marginBottom: '20px', 
            padding: '10px', 
            background: '#ffe6e6', 
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? (
            <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
          ) : (
            '🚀 Start Poll'
          )}
        </button>
      </form>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <h4 style={{ marginBottom: '10px', color: '#333' }}>💡 Tips:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Keep questions clear and concise</li>
          <li>Provide 2-6 options for best results</li>
          <li>Set appropriate time limits based on question complexity</li>
          <li>Students will see results after answering or when time expires</li>
        </ul>
      </div>
    </div>
  );
};

export default PollForm; 