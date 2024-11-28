import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db'; // MongoDB connection file
import Party from './models/partyModel'; // Import Party model
import axios from 'axios';  // Import axios

dotenv.config(); // Initialize environment variables
const app = express();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.json()); // Parse incoming JSON data

// Connect to MongoDB
connectDB(); // Assuming connectDB is properly handling the MongoDB connection

// Routes

// Fetch all parties
app.get('/parties', async (req: Request, res: Response) => {
  try {
    const parties = await Party.find(); // Fetch all parties from DB
    res.status(200).json(parties);
  } catch (error) {
    console.error('Error fetching parties:', error);
    res.status(500).json({ message: 'Error fetching parties' });
  }
});

// Add new party
app.post('/parties', async (req: Request, res: Response) => {
  const { name, date, location, poster } = req.body;

  // Log the request body for debugging
  console.log('Request Body:', req.body);

  try {
    const newParty = new Party({
      name,
      date,
      location,
      poster,
    });

    const savedParty = await newParty.save();
    res.status(201).json(savedParty);
  } catch (error) {
    console.error('Error adding party:', error);
    res.status(500).json({ message: 'Error adding party' });
  }
});


// ChatGPT chat

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

app.post('/api/chat', async (req: Request, res: Response) => {
  const { message } = req.body;

  // Optional: Add delay before making the request to OpenAI (if needed)
  await delay(1000); // Delay of 1 second (1000 milliseconds)

  try {
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // Use the model you want
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Set your OpenAI API Key here
        },
      }
    );

    // Send the ChatGPT response back to the frontend
    const reply = openaiResponse.data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error interacting with OpenAI:', error);
    res.status(500).json({ reply: 'Sorry, there was an error processing your message.' });
  }
});


// Server listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
