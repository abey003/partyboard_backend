import mongoose from 'mongoose';

// Define Party Schema
const partySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  poster: { type: String, required: true }, // Add poster field
});

// Create the Party model
const Party = mongoose.model('Party', partySchema);

export default Party;
