async function test() {
  try {
    const email = `test_${Date.now()}@example.com`;
    console.log('Registering with', email);
    
    const res1 = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: email, password: 'password123' })
    });
    const data1 = await res1.json();
    console.log('Register Response:', data1);

    const mongoose = require('mongoose');
    require('dotenv').config();
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./models/User');
    const user = await User.findOne({ email });
    console.log('OTP from DB:', user.otp);

    const res2 = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, otp: user.otp })
    });
    const data2 = await res2.json();
    console.log('Verify Response:', data2);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

test();
