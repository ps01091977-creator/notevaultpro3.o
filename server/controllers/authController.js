const User = require('../models/User');
const Notification = require('../models/Notification');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Send OTP for registration
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400);
      throw new Error('Please provide an email');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await Otp.findOneAndUpdate(
      { email },
      { otp },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const message = `Your NoteVault Pro verification code is ${otp}. It will expire in 5 minutes.`;
    
    try {
      await sendEmail({
        email,
        subject: 'NoteVault Pro - Email Verification',
        message
      });
      res.status(200).json({ message: 'OTP sent to email' });
    } catch (err) {
      await Otp.findOneAndDelete({ email });
      res.status(500);
      throw new Error('Email could not be sent. Please ensure EMAIL_USER and EMAIL_PASS are set in backend .env');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!otp) {
      res.status(400);
      throw new Error('OTP is required for registration');
    }

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      res.status(400);
      throw new Error('Invalid or expired OTP');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password, role: 'user' });

    if (user) {
      await Otp.findOneAndDelete({ email });

      // Notify admins
      await Notification.create({
        isGlobal: false,
        isAdminOnly: true,
        title: 'New User Registration',
        message: `${name} (${email}) has just created a new account.`,
        type: 'signup'
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Notify admins about login
      if (user.role !== 'admin') {
        await Notification.create({
          isGlobal: false,
          isAdminOnly: true,
          title: 'User Login',
          message: `${user.name} has just logged in to the portal.`,
          type: 'login'
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      res.status(400);
      throw new Error('No ID token provided');
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { email, name, picture } = ticket.getPayload();
    
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create user if they don't exist
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // random password
        avatar: picture,
        role: 'user'
      });
      
      await Notification.create({
        isGlobal: false,
        isAdminOnly: true,
        title: 'New User Registration (Google)',
        message: `${name} (${email}) has just created a new account via Google.`,
        type: 'signup'
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getUserProfile, sendOtp, googleLogin };
