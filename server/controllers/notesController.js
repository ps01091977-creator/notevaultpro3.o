const Note = require('../models/Note');

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res, next) => {
  try {
    const { subject, tag, search } = req.query;
    let query = {};

    if (subject) query.subject = subject;
    if (tag) query.tags = tag;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const notes = await Note.find(query).populate('subject', 'name color').sort({ isPinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res, next) => {
  try {
    const { title, content, type, fileUrl, subject, tags, color, isPinned } = req.body;
    
    const note = await Note.create({
      title,
      content,
      type,
      fileUrl,
      subject,
      tags,
      color,
      isPinned,
      owner: req.user._id
    });
    
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }

    if (note.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedNote);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }

    if (note.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await note.deleteOne();
    res.json({ message: 'Note removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Pin/Unpin a note
// @route   POST /api/notes/:id/pin
// @access  Private
const togglePinNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }

    if (note.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.json(note);
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote, togglePinNote };
