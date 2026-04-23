const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notevaultpro');
    console.log('Connected to DB');

    const adminExists = await User.findOne({ email: 'admin@notevault.com' });

    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@notevault.com',
        password: 'AdminPassword123!',
        role: 'admin'
      });
      console.log('✅ Admin user created successfully! (Email: admin@notevault.com, Password: AdminPassword123!)');
    } else {
      console.log('⚠️ Admin user already exists. (Email: admin@notevault.com)');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    process.exit();
  }
};

seedAdmin();
