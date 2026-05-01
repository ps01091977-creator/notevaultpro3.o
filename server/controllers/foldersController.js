const Folder = require('../models/Folder');

exports.getFolders = async (req, res) => {
  try {
    const { subject } = req.query;
    let query = {};
    if (subject) query.subject = subject;

    const folders = await Folder.find(query).sort({ createdAt: -1 });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createFolder = async (req, res) => {
  try {
    const { name, subject } = req.body;
    
    if (!name || !subject) {
      return res.status(400).json({ message: 'Name and subject are required' });
    }

    const folder = await Folder.create({
      name,
      subject,
      owner: req.user._id
    });

    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    await folder.deleteOne();
    res.json({ message: 'Folder removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
