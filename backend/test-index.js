import mongoose from 'mongoose';
import Accommodation from './src/models/accommodation.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

async function testIndex() {
  try {
    await mongoose.connect('mongodb://localhost:27017/dummy_index_test');
    
    // Attempt to create the unique index directly
    await Accommodation.collection.createIndex(
      { registration: 1, teamMemberId: 1 }, 
      { unique: true }
    );
    
    await Accommodation.deleteMany({});
    
    console.log("Creating booking A...");
    await Accommodation.create({
      participantName: "Booking A",
      hostelType: "BOYS",
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 86400000),
      accommodationDays: 1,
      amount: 100,
      currency: "INR",
      bookingStatus: "PENDING",
      paymentStatus: "PENDING",
      registration: null,
      teamMemberId: null
    });
    console.log("Booking A created.");
    
    console.log("Creating booking B...");
    await Accommodation.create({
      participantName: "Booking B",
      hostelType: "GIRLS",
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 86400000),
      accommodationDays: 1,
      amount: 100,
      currency: "INR",
      bookingStatus: "PENDING",
      paymentStatus: "PENDING",
      registration: null,
      teamMemberId: null
    });
    console.log("Booking B created. NO ERROR!");
    
  } catch (err) {
    console.error("ERROR CAUGHT:");
    console.error(err.message);
  } finally {
    await mongoose.connection.close();
  }
}

testIndex();
