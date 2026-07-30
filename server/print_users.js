const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function printUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notevaultpro');
    console.log('Connected to DB');

    const users = await User.find({}, 'name email role isVerified createdAt');
    console.log('\n=== USERS IN DATABASE ===');
    users.forEach(u => {
      console.log(`Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Verified: ${u.isVerified}`);
    });
    console.log('=========================\n');
    process.exit(0);
  } catch (error) {
    console.error('Error connecting/fetching:', error);
    process.exit(1);
  }
}

printUsers();
