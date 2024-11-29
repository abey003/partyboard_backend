import mongoose from 'mongoose';

const partySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  poster: { type: String, required: true },
  email: { type: String, required: true }, // Field to store the user's email
}, { timestamps: true });

const Party = mongoose.model('Party', partySchema);

export default Party;
