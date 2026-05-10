const User = require('../models/User');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        res.status(400);
        throw new Error('User already exists');
      }
      // If user exists but not verified, update name, password, and generate new OTP
      user.name = name;
      user.password = password;
    } else {
      user = new User({ name, email, password, role: 'user', isVerified: false });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Send OTP email
    try {
      await sendEmail({
        email: user.email,
        subject: 'NoteVault Pro - Verify your email',
        message: `Your OTP for registration is: ${otp}\n\nIt will expire in 10 minutes.`,
        html: `<h3>Welcome to NoteVault Pro!</h3><p>Your OTP for registration is: <b style="font-size: 20px;">${otp}</b></p><p>It will expire in 10 minutes.</p>`
      });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500);
      throw new Error('Failed to send verification email');
    }

    res.status(200).json({
      message: 'OTP sent to your email',
      requiresOtp: true,
      email: user.email
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.isVerified) {
      res.status(400);
      throw new Error('User is already verified');
    }

    if (user.otp !== otp) {
      res.status(400);
      throw new Error('Invalid OTP');
    }

    if (user.otpExpires < new Date()) {
      res.status(400);
      throw new Error('OTP expired');
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Notify admins
    await Notification.create({
      isGlobal: false,
      isAdminOnly: true,
      title: 'New User Registration',
      message: `${user.name} (${user.email}) has just created a new verified account.`,
      type: 'signup'
    });

    res.status(200).json({
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

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.isVerified) {
      res.status(400);
      throw new Error('User is already verified');
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: 'NoteVault Pro - Verify your email',
        message: `Your new OTP for registration is: ${otp}\n\nIt will expire in 10 minutes.`,
        html: `<h3>NoteVault Pro</h3><p>Your new OTP for registration is: <b style="font-size: 20px;">${otp}</b></p><p>It will expire in 10 minutes.</p>`
      });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500);
      throw new Error('Failed to send verification email');
    }

    res.status(200).json({ message: 'OTP resent successfully' });
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
      // Allow login if isVerified is true OR if it's an old account where isVerified is undefined
      if (user.isVerified === false) {
        res.status(401);
        throw new Error('Please verify your email to login. Use the register page to receive an OTP.');
      }

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

module.exports = { registerUser, verifyOtp, resendOtp, loginUser, getUserProfile };
