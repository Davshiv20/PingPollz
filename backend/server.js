const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Redis = require('ioredis');

// Connect to Redis

const redis = new Redis(process.env.REDIS_URL);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
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

// Helper functions
const pollTimers = {}; // Keep timers in memory as they are process-specific

const endPoll = async (pollId) => {
    const pollJson = await redis.hget('polls', pollId);
    if (!pollJson) return;

    const poll = JSON.parse(pollJson);
    if (poll.isActive) {
        poll.isActive = false;
        await redis.hset('polls', pollId, JSON.stringify(poll));
        await redis.del('currentPollId');

        io.emit('poll_ended', {
            poll_id: pollId,
            final_results: poll.results
        });
    }
};

// Socket.IO events
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Store mapping from socket ID to student ID for cleanup
    socket.on('register_socket', async (studentId) => {
        await redis.set(`socket:${socket.id}`, studentId);
    });

    socket.on('disconnect', async () => {
        console.log('Client disconnected:', socket.id);
        const studentId = await redis.get(`socket:${socket.id}`);
        if (studentId) {
            await redis.hdel('students', studentId);
            await redis.del(`socket:${socket.id}`);
            io.emit('student_left', { student_id: studentId });
        }
    });

    socket.on('join_as_student', async (data, callback) => {
        const studentName = data.name;
        if (!studentName) {
            return callback({ error: 'Name is required' });
        }

        const studentId = uuidv4();
        const student = {
            id: studentId,
            name: studentName,
            sessionId: socket.id,
            joinedAt: new Date()
        };

        await redis.hset('students', studentId, JSON.stringify(student));
        await redis.set(`socket:${socket.id}`, studentId); // Store mapping

        io.emit('student_joined', { student_id: studentId, name: studentName });

        const currentPollId = await redis.get('currentPollId');
        if (currentPollId) {
            const pollJson = await redis.hget('polls', currentPollId);
            const poll = JSON.parse(pollJson);
            if (poll && poll.isActive) {
                const elapsed = (Date.now() - poll.createdAt) / 1000;
                const remaining = Math.max(0, poll.maxTime - elapsed);
                socket.emit('current_poll', {
                    poll,
                    time_remaining: Math.floor(remaining)
                });
            }
        }

        callback({ student_id: studentId, name: studentName });
    });

    socket.on('create_poll', async (data, callback) => {
        const activePollId = await redis.get('currentPollId');
        if (activePollId) {
            return callback({ error: 'There is already an active poll' });
        }

        const pollId = uuidv4();
        const poll = {
            id: pollId,
            question: data.question,
            options: data.options,
            correctOptions: data.correctOptions || [],
            maxTime: data.max_time || 60,
            createdAt: Date.now(),
            isActive: true,
            results: {},
            answeredStudents: []
        };
        
        await redis.hset('polls', pollId, JSON.stringify(poll));
        await redis.set('currentPollId', pollId);

        pollTimers[pollId] = setTimeout(() => {
            endPoll(pollId);
            delete pollTimers[pollId];
        }, poll.maxTime * 1000);

        io.emit('poll_created', poll);
        callback({ success: true, poll_id: pollId });
    });

    socket.on('submit_answer', async (data, callback) => {
        const { poll_id, student_id, answer } = data;

        const currentPollId = await redis.get('currentPollId');
        if (!currentPollId || currentPollId !== poll_id) {
            return callback({ error: 'No active poll or poll mismatch' });
        }
        
        const studentExists = await redis.hexists('students', student_id);
        if (!studentExists) {
            return callback({ error: 'Student not found' });
        }

        const pollJson = await redis.hget('polls', poll_id);
        const poll = JSON.parse(pollJson);

        if (poll.answeredStudents.includes(student_id)) {
            return callback({ error: 'Already answered' });
        }

        if (!poll.results[answer]) {
            poll.results[answer] = 0;
        }
        poll.results[answer]++;
        poll.answeredStudents.push(student_id);

        await redis.hset('polls', poll_id, JSON.stringify(poll));
        
        const studentCount = await redis.hlen('students');
        io.emit('poll_results_updated', {
            poll_id: poll_id,
            results: poll.results,
            answered_count: poll.answeredStudents.length,
            total_students: studentCount
        });

        callback({ success: true });
    });

    socket.on('send_chat_message', async (data, callback) => {
        const { sender, message, sender_type } = data;
        if (!sender || !message) {
            return callback({ error: 'Sender and message required' });
        }
        
        const chatMessage = {
            id: uuidv4(),
            sender,
            message,
            timestamp: new Date(),
            sender_type
        };

        await redis.lpush('chat_messages', JSON.stringify(chatMessage));
        await redis.ltrim('chat_messages', 0, 99); // Keep only the latest 100 messages

        io.emit('chat_message', chatMessage);
        callback({ success: true });
    });
});

// REST API endpoints
app.get('/', (req, res) => {
  res.json({ message: 'Live Polling System API' });
});

app.get('/api/polls', async (req, res) => {
    const pollsDict = await redis.hgetall('polls');
    const polls = Object.values(pollsDict).map(p => JSON.parse(p));
    res.json({ polls });
});

app.get('/api/current-poll', async (req, res) => {
    const pollId = await redis.get('currentPollId');
    if (pollId) {
        const pollJson = await redis.hget('polls', pollId);
        const poll = JSON.parse(pollJson);
        const elapsed = (Date.now() - poll.createdAt) / 1000;
        const remaining = Math.max(0, poll.maxTime - elapsed);
        res.json({
            poll,
            time_remaining: Math.floor(remaining)
        });
    } else {
        res.json({ poll: null });
    }
});

app.get('/api/students', async (req, res) => {
    const studentsDict = await redis.hgetall('students');
    const students = Object.values(studentsDict).map(s => JSON.parse(s));
    res.json({ students });
});

app.get('/api/chat-messages', async (req, res) => {
    const messagesJson = await redis.lrange('chat_messages', 0, -1);
    const messages = messagesJson.map(m => JSON.parse(m)).reverse();
    res.json({ messages });
});

app.post('/api/end-poll', async (req, res) => {
    const pollId = await redis.get('currentPollId');
    if (pollId) {
        if (pollTimers[pollId]) {
            clearTimeout(pollTimers[pollId]);
            delete pollTimers[pollId];
        }
        await endPoll(pollId);
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'No active poll' });
    }
});

app.post('/api/kick-student/:studentId', async (req, res) => {
    const { studentId } = req.params;
    const studentJson = await redis.hget('students', studentId);
    
    if (studentJson) {
        const student = JSON.parse(studentJson);
        io.to(student.sessionId).emit('student_kicked', {
            student_id: studentId,
            name: student.name
        });
        await redis.hdel('students', studentId);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Student not found' });
    }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await redis.ping();
    res.status(200).json({ status: 'ok', redis: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'error', redis: 'disconnected' });
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 