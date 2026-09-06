import mongoose from 'mongoose';
import Event from './src/models/Event.js';

mongoose.connect('mongodb://localhost:27017/scintillace-2026').then(async () => {
  const event = await Event.findOne({ type: 'INDIVIDUAL' });
  console.log(event._id, event.title, event.type, event.isPaid);
  process.exit(0);
});
