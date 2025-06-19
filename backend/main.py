from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import socketio
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
import time
from datetime import datetime
import asyncio

app = FastAPI(title="Live Polling System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.IO setup
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode='asyncio')
socket_app = socketio.ASGIApp(sio, app)

# Data models
class Poll(BaseModel):
    id: str
    question: str
    options: List[str]
    max_time: int = 60
    created_at: datetime
    is_active: bool = True
    results: Dict[str, int] = {}
    answered_students: List[str] = []

class Student(BaseModel):
    id: str
    name: str
    session_id: str
    joined_at: datetime

class ChatMessage(BaseModel):
    id: str
    sender: str
    message: str
    timestamp: datetime
    sender_type: str  # 'teacher' or 'student'

# Global state
polls: Dict[str, Poll] = {}
students: Dict[str, Student] = {}
chat_messages: List[ChatMessage] = []
current_poll: Optional[Poll] = None
poll_timers: Dict[str, asyncio.Task] = {}

# Socket.IO events
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    # Remove student if they disconnect
    for student_id, student in students.items():
        if student.session_id == sid:
            del students[student_id]
            await sio.emit('student_left', {'student_id': student_id}, skip_sid=sid)
            break

@sio.event
async def join_as_student(sid, data):
    """Student joins the session"""
    student_name = data.get('name')
    if not student_name:
        return {'error': 'Name is required'}
    
    # Check if name is already taken in this session
    for student in students.values():
        if student.name == student_name and student.session_id == sid:
            return {'error': 'Name already taken in this session'}
    
    student_id = f"student_{len(students) + 1}"
    student = Student(
        id=student_id,
        name=student_name,
        session_id=sid,
        joined_at=datetime.now()
    )
    students[student_id] = student
    
    await sio.emit('student_joined', {
        'student_id': student_id,
        'name': student_name
    }, skip_sid=sid)
    
    # Send current state to new student
    if current_poll and current_poll.is_active:
        await sio.emit('current_poll', {
            'poll': current_poll.dict(),
            'time_remaining': get_time_remaining(current_poll.id)
        }, room=sid)
    
    return {'student_id': student_id, 'name': student_name}

@sio.event
async def create_poll(sid, data):
    """Teacher creates a new poll"""
    if current_poll and current_poll.is_active:
        return {'error': 'There is already an active poll'}
    
    poll_id = f"poll_{len(polls) + 1}"
    poll = Poll(
        id=poll_id,
        question=data.get('question'),
        options=data.get('options', []),
        max_time=data.get('max_time', 60),
        created_at=datetime.now()
    )
    
    polls[poll_id] = poll
    global current_poll
    current_poll = poll
    
    # Start timer
    poll_timers[poll_id] = asyncio.create_task(poll_timer(poll_id))
    
    await sio.emit('poll_created', poll.dict())
    return {'success': True, 'poll_id': poll_id}

@sio.event
async def submit_answer(sid, data):
    """Student submits an answer"""
    poll_id = data.get('poll_id')
    student_id = data.get('student_id')
    answer = data.get('answer')
    
    if not current_poll or current_poll.id != poll_id or not current_poll.is_active:
        return {'error': 'No active poll'}
    
    if student_id not in students:
        return {'error': 'Student not found'}
    
    if student_id in current_poll.answered_students:
        return {'error': 'Already answered'}
    
    # Record answer
    if answer not in current_poll.results:
        current_poll.results[answer] = 0
    current_poll.results[answer] += 1
    current_poll.answered_students.append(student_id)
    
    # Emit updated results
    await sio.emit('poll_results_updated', {
        'poll_id': poll_id,
        'results': current_poll.results,
        'answered_count': len(current_poll.answered_students),
        'total_students': len(students)
    })
    
    return {'success': True}

@sio.event
async def send_chat_message(sid, data):
    """Send chat message"""
    sender = data.get('sender')
    message = data.get('message')
    sender_type = data.get('sender_type')
    
    if not sender or not message:
        return {'error': 'Sender and message required'}
    
    chat_id = f"chat_{len(chat_messages) + 1}"
    chat_message = ChatMessage(
        id=chat_id,
        sender=sender,
        message=message,
        timestamp=datetime.now(),
        sender_type=sender_type
    )
    
    chat_messages.append(chat_message)
    
    await sio.emit('chat_message', chat_message.dict())
    return {'success': True}

def get_time_remaining(poll_id):
    """Calculate remaining time for a poll"""
    if poll_id not in polls:
        return 0
    
    poll = polls[poll_id]
    elapsed = (datetime.now() - poll.created_at).total_seconds()
    remaining = max(0, poll.max_time - elapsed)
    return int(remaining)

async def poll_timer(poll_id):
    """Timer for poll expiration"""
    poll = polls.get(poll_id)
    if not poll:
        return
    
    await asyncio.sleep(poll.max_time)
    
    if poll_id in polls and polls[poll_id].is_active:
        polls[poll_id].is_active = False
        await sio.emit('poll_ended', {
            'poll_id': poll_id,
            'final_results': polls[poll_id].results
        })

# REST API endpoints
@app.get("/")
async def root():
    return {"message": "Live Polling System API"}

@app.get("/api/polls")
async def get_polls():
    return {"polls": [poll.dict() for poll in polls.values()]}

@app.get("/api/current-poll")
async def get_current_poll():
    if current_poll:
        return {
            "poll": current_poll.dict(),
            "time_remaining": get_time_remaining(current_poll.id)
        }
    return {"poll": None}

@app.get("/api/students")
async def get_students():
    return {"students": [student.dict() for student in students.values()]}

@app.get("/api/chat-messages")
async def get_chat_messages():
    return {"messages": [msg.dict() for msg in chat_messages]}

@app.post("/api/end-poll")
async def end_poll():
    global current_poll
    if current_poll and current_poll.is_active:
        current_poll.is_active = False
        if current_poll.id in poll_timers:
            poll_timers[current_poll.id].cancel()
            del poll_timers[current_poll.id]
        await sio.emit('poll_ended', {
            'poll_id': current_poll.id,
            'final_results': current_poll.results
        })
        return {"success": True}
    return {"error": "No active poll"}

@app.post("/api/kick-student/{student_id}")
async def kick_student(student_id: str):
    if student_id in students:
        student = students[student_id]
        await sio.emit('student_kicked', {
            'student_id': student_id,
            'name': student.name
        }, room=student.session_id)
        del students[student_id]
        return {"success": True}
    return {"error": "Student not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8000) 