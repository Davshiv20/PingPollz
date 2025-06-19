const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Global state
let polls = {};
let students = {};
let chatMessages = [];
let currentPoll = null;
let pollTimers = {};

// Helper functions
const getTimeRemaining = (pollId) => {
  if (!polls[pollId]) return 0;
  
  const poll = polls[pollId];
  const elapsed = (Date.now() - poll.createdAt) / 1000;
  const remaining = Math.max(0, poll.maxTime - elapsed);
  return Math.floor(remaining);
};

const endPoll = (pollId) => {
  if (polls[pollId] && polls[pollId].isActive) {
    polls[pollId].isActive = false;
    io.emit('poll_ended', {
      poll_id: pollId,
      final_results: polls[pollId].results
    });
  }
};

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove student if they disconnect
    for (const [studentId, student] of Object.entries(students)) {
      if (student.sessionId === socket.id) {
        delete students[studentId];
        socket.broadcast.emit('student_left', { student_id: studentId });
        break;
      }
    }
  });

  socket.on('join_as_student', (data, callback) => {
    const studentName = data.name;
    if (!studentName) {
      return callback({ error: 'Name is required' });
    }
    
    // Check if name is already taken in this session
    for (const student of Object.values(students)) {
      if (student.name === studentName && student.sessionId === socket.id) {
        return callback({ error: 'Name already taken in this session' });
      }
    }
    
    const studentId = `student_${Object.keys(students).length + 1}`;
    const student = {
      id: studentId,
      name: studentName,
      sessionId: socket.id,
      joinedAt: new Date()
    };
    
    students[studentId] = student;
    
    socket.broadcast.emit('student_joined', {
      student_id: studentId,
      name: studentName
    });
    
    // Send current state to new student
    if (currentPoll && currentPoll.isActive) {
      socket.emit('current_poll', {
        poll: currentPoll,
        time_remaining: getTimeRemaining(currentPoll.id)
      });
    }
    
    callback({ student_id: studentId, name: studentName });
  });

  socket.on('create_poll', (data, callback) => {
    if (currentPoll && currentPoll.isActive) {
      return callback({ error: 'There is already an active poll' });
    }
    
    const pollId = `poll_${Object.keys(polls).length + 1}`;
    const poll = {
      id: pollId,
      question: data.question,
      options: data.options,
      maxTime: data.max_time || 60,
      createdAt: Date.now(),
      isActive: true,
      results: {},
      answeredStudents: []
    };
    
    polls[pollId] = poll;
    currentPoll = poll;
    
    // Start timer
    pollTimers[pollId] = setTimeout(() => {
      endPoll(pollId);
    }, poll.maxTime * 1000);
    
    io.emit('poll_created', poll);
    callback({ success: true, poll_id: pollId });
  });

  socket.on('submit_answer', (data, callback) => {
    const { poll_id, student_id, answer } = data;
    
    if (!currentPoll || currentPoll.id !== poll_id || !currentPoll.isActive) {
      return callback({ error: 'No active poll' });
    }
    
    if (!students[student_id]) {
      return callback({ error: 'Student not found' });
    }
    
    if (currentPoll.answeredStudents.includes(student_id)) {
      return callback({ error: 'Already answered' });
    }
    
    // Record answer
    if (!currentPoll.results[answer]) {
      currentPoll.results[answer] = 0;
    }
    currentPoll.results[answer]++;
    currentPoll.answeredStudents.push(student_id);
    
    // Emit updated results
    io.emit('poll_results_updated', {
      poll_id: poll_id,
      results: currentPoll.results,
      answered_count: currentPoll.answeredStudents.length,
      total_students: Object.keys(students).length
    });
    
    callback({ success: true });
  });

  socket.on('send_chat_message', (data, callback) => {
    const { sender, message, sender_type } = data;
    
    if (!sender || !message) {
      return callback({ error: 'Sender and message required' });
    }
    
    const chatId = `chat_${chatMessages.length + 1}`;
    const chatMessage = {
      id: chatId,
      sender: sender,
      message: message,
      timestamp: new Date(),
      sender_type: sender_type
    };
    
    chatMessages.push(chatMessage);
    
    io.emit('chat_message', chatMessage);
    callback({ success: true });
  });
});

// REST API endpoints
app.get('/', (req, res) => {
  res.json({ message: 'Live Polling System API' });
});

app.get('/api/polls', (req, res) => {
  res.json({ polls: Object.values(polls) });
});

app.get('/api/current-poll', (req, res) => {
  if (currentPoll) {
    res.json({
      poll: currentPoll,
      time_remaining: getTimeRemaining(currentPoll.id)
    });
  } else {
    res.json({ poll: null });
  }
});

app.get('/api/students', (req, res) => {
  res.json({ students: Object.values(students) });
});

app.get('/api/chat-messages', (req, res) => {
  res.json({ messages: chatMessages });
});

app.post('/api/end-poll', (req, res) => {
  if (currentPoll && currentPoll.isActive) {
    currentPoll.isActive = false;
    if (pollTimers[currentPoll.id]) {
      clearTimeout(pollTimers[currentPoll.id]);
      delete pollTimers[currentPoll.id];
    }
    io.emit('poll_ended', {
      poll_id: currentPoll.id,
      final_results: currentPoll.results
    });
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'No active poll' });
  }
});

app.post('/api/kick-student/:studentId', (req, res) => {
  const { studentId } = req.params;
  
  if (students[studentId]) {
    const student = students[studentId];
    io.to(student.sessionId).emit('student_kicked', {
      student_id: studentId,
      name: student.name
    });
    delete students[studentId];
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 