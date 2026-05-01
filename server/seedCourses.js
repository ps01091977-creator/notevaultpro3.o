const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const initialCourses = [
  { name: 'B.Tech', durationYears: 4, maxSemesters: 8, branches: ['CSE', 'IT', 'ECE', 'Mechanical', 'Civil'] },
  { name: 'B.Pharm', durationYears: 4, maxSemesters: 8, branches: ['General'] },
  { name: 'MCA', durationYears: 2, maxSemesters: 4, branches: ['General'] },
  { name: 'MBA', durationYears: 2, maxSemesters: 4, branches: ['Finance', 'Marketing', 'HR'] }
];

const seedData = async () => {
  try {
    await Course.deleteMany({});
    await Course.insertMany(initialCourses);
    console.log('Courses seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
