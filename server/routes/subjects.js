const express = require('express');
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectsController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getSubjects)
  .post(protect, admin, createSubject);

router.route('/:id')
  .put(protect, admin, updateSubject)
  .delete(protect, admin, deleteSubject);

module.exports = router;
