import mongoose from 'mongoose';
import Event from './src/models/Event.js';
import Festival from './src/models/Festival.js';
import User from './src/models/User.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/festsphere');
  const user = await User.findOne();
  let festival = await Festival.findOne();
  if(!festival) festival = await Festival.create({ name: 'TestFest', status: 'ACTIVE' });
  const event = await Event.create({
    title: 'Test Workshop',
    description: 'Test Description',
    festival: festival._id,
    category: 'TECHNICAL',
    type: 'INDIVIDUAL',
    registrationMethod: 'SYSTEM',
    registrationMode: 'PAID',
    registrationRequired: true,
    isPaid: true,
    registrationFee: 100,
    status: 'PUBLISHED',
    registrationOpen: true,
    createdBy: user._id
  });
  console.log(event._id.toString());
  process.exit(0);
}
run();
