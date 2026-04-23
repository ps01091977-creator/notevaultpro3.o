const Subject = require('../models/Subject');

// @desc    Get all subjects for user
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.semester) {
      query.semester = parseInt(req.query.semester);
    }
    const subjects = await Subject.find(query);
    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res, next) => {
  try {
    const { name, semester, color, emoji } = req.body;
    const subject = await Subject.create({
      name,
      semester,
      color,
      emoji,
      owner: req.user._id
    });
    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      res.status(404);
      throw new Error('Subject not found');
    }

    if (subject.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedSubject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      res.status(404);
      throw new Error('Subject not found');
    }

    if (subject.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await subject.deleteOne();
    res.json({ message: 'Subject removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
