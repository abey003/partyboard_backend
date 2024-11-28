import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI || '';
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
