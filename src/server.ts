import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db'; // MongoDB connection file
import Party from './models/partyModel'; // Import Party model
import axios from 'axios';
import { AxiosError } from 'axios'; // Import axios
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config(); // Initialize environment variables
const app = express();

// Create an HTTP server to pass to WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server }); // WebSocket server for handling WebSocket connections

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.json()); // Parse incoming JSON data

// Connect to MongoDB
connectDB();

// WebSocket server handling connections
wss.on('connection', (ws: WebSocket, req: any) => {
  ws.on('message', (message: string) => {
    wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {});
});

// Routes for Party-related operations

// Fetch all parties
app.get('/parties', async (req: Request, res: Response) => {
  try {
    const parties = await Party.find(); // Fetch all parties from DB
    res.status(200).json(parties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parties' });
  }
});

// Add a new party
app.post('/parties', async (req: Request, res: Response) => {
  const { name, date, location, poster, email } = req.body;

  try {
    const newParty = new Party({
      name,
      date,
      location,
      poster,
      email,
    });

    const savedParty = await newParty.save();
    res.status(201).json(savedParty);
  } catch (error) {
    res.status(500).json({ message: 'Error adding party' });
  }
});

// Fetch all parties uploaded by the current user
app.get('/parties/user', async (req: Request, res: Response) => {
  const userEmail = req.query.email as string;

  try {
    const userParties = await Party.find({ email: userEmail });
    res.status(200).json(userParties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user parties' });
  }
});

// Delete a specific party by its ID
app.delete('/parties/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedParty = await Party.findByIdAndDelete(id);
    res.status(200).json({ message: 'Party deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting party' });
  }
});

// Update a specific party by its ID
app.put('/parties/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, date, location, poster, email } = req.body;

  try {
    const updatedParty = await Party.findByIdAndUpdate(
      id,
      { name, date, location, poster },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Party updated successfully', party: updatedParty });
  } catch (error) {
    res.status(500).json({ message: 'Error updating party' });
  }
});

// ChatGPT Chat - Retry Logic for OpenAI API requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryRequest = async (message: string, retries: number = 10): Promise<string> => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      const reply = response.data.choices[0].message.content;
      return reply;
    } catch (error: unknown) {
      attempt++;

      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 429 || axiosError.response?.status === 500) {
        await delay(1000 * Math.pow(2, attempt));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retry attempts reached');
};

// ChatGPT API route
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message } = req.body;

  try {
    const reply = await retryRequest(message);
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ reply: 'Sorry, there was an error processing your message.' });
  }
});

// Server listener
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {});
