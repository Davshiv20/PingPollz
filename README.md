# Live Polling System

A real-time polling system built with Express.js backend and React frontend, featuring Socket.IO for real-time communication and React Query for efficient API management.

## Features

### Teacher Features
- ✅ Create new polls with configurable time limits
- ✅ View live polling results in real-time
- ✅ Manage connected students (kick students)
- ✅ View past poll results
- ✅ Built-in chat system

### Student Features
- ✅ Join sessions with unique names (per browser tab)
- ✅ Answer polls with countdown timer
- ✅ View live results after answering
- ✅ Automatic timeout handling (60 seconds default)
- ✅ Built-in chat system

### Technical Features
- ✅ Real-time updates using Socket.IO
- ✅ React Query for efficient API management
- ✅ Redux for state management
- ✅ Responsive design
- ✅ Modern UI with animations

## Project Structure

```
polling-system/
├── backend/                 # Express.js backend
│   ├── package.json
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # React Query hooks
│   │   ├── services/      # API and Socket services
│   │   ├── store/         # Redux store and slices
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Open the application** in your browser at `http://localhost:3000`

2. **Choose your role**:
   - **Teacher**: Can create polls and manage the session
   - **Student**: Can join and answer polls

3. **For Students**:
   - Enter your name (unique per browser tab)
   - Wait for the teacher to start a poll
   - Answer within the time limit
   - View live results

4. **For Teachers**:
   - Create polls with questions and options
   - Set time limits (10-300 seconds)
   - View live results as students answer
   - Manage connected students
   - Use the chat system

## API Endpoints

### REST API (Backend)
- `GET /api/polls` - Get all polls
- `GET /api/current-poll` - Get current active poll
- `GET /api/students` - Get connected students
- `GET /api/chat-messages` - Get chat messages
- `POST /api/end-poll` - End current poll
- `POST /api/kick-student/:id` - Kick a student

### Socket.IO Events
- `join_as_student` - Student joins session
- `create_poll` - Teacher creates new poll
- `submit_answer` - Student submits answer
- `send_chat_message` - Send chat message

## Technologies Used

### Backend
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique identifier generation

### Frontend
- **React** - UI library
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing

## Development

### Backend Development
- The server uses nodemon for automatic restarts
- Socket.IO handles real-time events
- In-memory storage (can be extended with database)

### Frontend Development
- React Query handles API calls and caching
- Redux manages client-side state
- Socket.IO client connects to backend
- Responsive design with CSS Grid and Flexbox

## Deployment

### Backend Deployment
1. Set environment variables:
   - `PORT` - Server port (default: 5000)
   - `NODE_ENV` - Environment (production/development)

2. Install dependencies and start:
```bash
npm install
npm start
```

### Frontend Deployment
1. Build the application:
```bash
npm run build
```

2. Serve the build folder using a static server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

