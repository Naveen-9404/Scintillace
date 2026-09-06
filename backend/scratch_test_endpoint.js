import axios from 'axios';

async function test() {
  try {
    // Technical Quiz ID: 6a8937a5bebeb93493556c70
    // Email: test@example.com (which is registered for Workshop)

    const payload = {
      eventId: "6a8937a5bebeb93493556c70", // Technical Quiz
      participantName: "Test User",
      participantEmail: "test@example.com",
      participantPhone: "1234567890",
      collegeId: "C123",
      department: "CSE",
      yearOfStudy: "3"
    };

    console.log("Making POST request for Technical Quiz...");
    const res = await axios.post('http://localhost:5000/api/v1/registrations/public', payload);
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
