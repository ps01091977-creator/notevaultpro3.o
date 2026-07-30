const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function cleanupDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notevaultpro');
    console.log('Connected to DB');

    // 1. Delete the legacy student and administrator seed accounts (243601 and admin)
    const deleteResult = await User.deleteMany({ email: { $in: ['243601', 'admin'] } });
    console.log(`Deleted ${deleteResult.deletedCount} legacy accounts (243601 and admin)`);

    // 2. Mark all other user accounts as verified so they can login successfully
    const updateResult = await User.updateMany(
      { email: { $nin: ['243601', 'admin'] } },
      { $set: { isVerified: true } }
    );
    console.log(`Marked ${updateResult.modifiedCount} accounts as verified (isVerified: true)`);

    console.log('Database cleanup and verification completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupDb();
