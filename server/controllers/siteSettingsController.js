const SiteSettings = require('../models/SiteSettings');

// Get Settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await SiteSettings.create({
        features: [
          {
            title: 'Premium PDF Notes',
            desc: 'Handwritten and typed notes perfectly aligned with your university syllabus.',
            icon: 'BookOpen',
            color: 'text-blue-400',
            bg: 'bg-blue-400/10'
          },
          {
            title: 'Targeted Video Lectures',
            desc: 'Ditch the YouTube distractions. Ad-free, to-the-point lectures.',
            icon: 'Monitor',
            color: 'text-purple-400',
            bg: 'bg-purple-400/10'
          },
          {
            title: 'PYQs & Quantums',
            desc: 'Master the exam pattern with year-wise previous question papers.',
            icon: 'Zap',
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10'
          }
        ],
        testimonials: [
          { name: 'Rahul Sharma', role: 'B.Tech CS, 3rd Year', text: 'NoteVault Pro completely changed my study routine.' },
          { name: 'Priya Patel', role: 'B.Pharm, 2nd Year', text: 'The video lectures are straight to the point.' },
          { name: 'Ankit Kumar', role: 'MBA, Final Year', text: 'The PYQ section with detailed solutions is a lifesaver.' }
        ]
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching site settings' });
  }
};

// Update Settings (Admin Only)
exports.updateSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne();
    if (!settings) {
      const newSettings = await SiteSettings.create(req.body);
      return res.json(newSettings);
    }
    
    const updatedSettings = await SiteSettings.findByIdAndUpdate(
      settings._id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating site settings' });
  }
};
