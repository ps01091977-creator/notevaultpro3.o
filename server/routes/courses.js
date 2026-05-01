const express = require('express');
const { getCourses, createCourse, updateCourse, deleteCourse } = require('../controllers/coursesController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getCourses)
  .post(protect, admin, createCourse);

router.route('/:id')
  .put(protect, admin, updateCourse)
  .delete(protect, admin, deleteCourse);

module.exports = router;
