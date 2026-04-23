import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Session from './models/Session';
import Telemetry from './models/Telemetry';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://akashkumar9973056437_db_user:jZfZRHHwqrSQAbWF@akku001.sgictum.mongodb.net/')
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Atlas connection error:', err));

// --- RESTful API Routes ---

// 1. Get all sessions for a specific user
app.get('/api/sessions/:userId', async (req: Request, res: Response) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    // Map _id over to id so the frontend component can read it seamlessly
    const mappedSessions = sessions.map(s => ({
      id: s._id,
      title: s.title,
      content: s.content,
      createdAt: s.createdAt,
    }));
    res.json(mappedSessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// 2. Create a new session
app.post('/api/sessions', async (req: Request, res: Response) => {
  try {
    const { userId, title } = req.body;
    const newSession = new Session({ userId, title, content: '' });
    const savedSession = await newSession.save();
    
    // Return mapped object to match frontend expectations
    res.status(201).json({
      id: savedSession._id,
      title: savedSession.title,
      content: savedSession.content,
      createdAt: savedSession.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// 3. Update session content (auto-save)
app.put('/api/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const updatedSession = await Session.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );
    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// 4. Save Telemetry batch
app.post('/api/telemetry', async (req: Request, res: Response) => {
  try {
    const { sessionId, userId, events } = req.body;
    
    // Push events to existing telemetry doc, or create a brand new one
    let telemetry = await Telemetry.findOne({ sessionId });
    
    if (telemetry) {
      telemetry.events.push(...events);
      await telemetry.save();
    } else {
      telemetry = new Telemetry({ sessionId, userId, events });
      await telemetry.save();
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save telemetry' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
