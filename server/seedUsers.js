const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Remove existing users with these IDs to recreate them cleanly
    await User.deleteMany({ email: { $in: ['243601', 'admin'] } });

    const user = new User({
      name: 'Student',
      email: '243601',
      password: 'aktu143',
      role: 'user',
      isVerified: true
    });
    await user.save();
    console.log('User created:', user.email);

    const admin = new User({
      name: 'Administrator',
      email: 'admin',
      password: 'admin',
      role: 'admin',
      isVerified: true
    });
    await admin.save();
    console.log('Admin created:', admin.email);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
