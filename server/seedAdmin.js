const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notevaultpro');
    console.log('Connected to DB');

    const adminExists = await User.findOne({ email: 'priyanshu123@gmail.com' });

    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'priyanshu123@gmail.com',
        password: 'priyanshu@123',
        role: 'admin',
        isVerified: true
      });
      console.log('✅ Admin user created successfully! (Email: priyanshu123@gmail.com, Password: priyanshu@123)');
    } else {
      // Ensure existing admin user has the correct email, password, role, and is verified
      adminExists.role = 'admin';
      adminExists.isVerified = true;
      adminExists.password = 'priyanshu@123';
      await adminExists.save();
      console.log('⚠️ Admin user already exists/updated. (Email: priyanshu123@gmail.com, Password: priyanshu@123)');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);       
  } finally {
    process.exit();
  }
};

seedAdmin();

/*

priyanshu123@gmail.com

*/