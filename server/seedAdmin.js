const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notevaultpro');
    console.log('Connected to DB');

    const adminExists = await User.findOne({ email: 'admin@notevaultpro.com' });

    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@notevaultpro.com',
        password: 'AdminPassword123!',
        role: 'admin'
      });
      console.log('✅ Admin user created successfully! (Email: admin@notevaultpro.com, Password: AdminPassword123!)');
    } else {
      console.log('⚠️ Admin user already exists. (Email: admin@notevaultpro.com)');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);       
  } finally {
    process.exit();
  }
};

seedAdmin();

/*

admin@notevaultpro.com

run the 

*/