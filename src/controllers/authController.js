const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const User = require('../models/userModel');
const AppError = require('../utils/appError');

dotenv.config({ path: './config.env' });

const jwtToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN * 1000,
  });
};

const createJwtToken = (user, statusCode, res) => {
  const token = jwtToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_EXPIRES_IN * 1000),
    httpOnly: false,
    sameSite: 'none',
    secure: true,
  };
  res.cookie('jwt', token, cookieOptions);

  // Output of pwd should not be visible
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    cookieOptions,
    data: { user },
  });
};

exports.signup = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (user)
    return next(new AppError(409, 'User already exists with this email.'));

  const newUser = await User.create(req.body);

  // const token = jwtToken(newUser._id);

  // res.status(200).json({
  //   status: 'success',
  //   data: { newUser, token },
  // });

  createJwtToken(newUser, 200, res);
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError(400, 'Please provide both email and password'));

  let user = await User.findOne({ email }).select('+password');

  if (
    !user ||
    user.email !== email ||
    !(await user.checkPassword(password, user.password)) // comes from model - instance function
  ) {
    return next(new AppError(401, 'Email or password is incorrect.'));
  }

  // const token = jwtToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     user,
  //     token,
  //   },
  // });

  createJwtToken(user, 200, res);
};

exports.protect = async (req, res, next) => {
  // 1. Check if token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    return next(
      new AppError(401, 'You are not logged in. Please login to access.')
    );
  }

  // 2. Verification => if token belongs to the user that has requested for the route
  const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3. Check if the user exists
  const user = await User.findById(decoded.id);

  if (!user)
    return next(new AppError(401, 'The user with the token is not valid'));

  // 4. Verify if the token was issued after the password was changed
  if (user.isTokenValid(decoded.iat)) {
    return next(
      new AppError(
        401,
        'User recently changed the password. Please login with the new one.'
      )
    );
  }

  // 5. Return the data with the req.user
  req.user = user;
  next();
};

exports.isLoggedIn = async (req, res, next) => {
  let token = req.cookies;
  if (token) {
    res.status(200).json({
      status: 'success',
      token,
    });
  }
  next();
};

exports.updatePassword = async (req, res, next) => {
  // 1. Get password from user
  const { currentPassword, newPassword } = req.body;

  // 2. Verify the current password with db
  const currentUser = await User.findById(req.user._id).select('+password');
  if (
    !(await currentUser.checkPassword(currentPassword, currentUser.password))
  ) {
    next(
      new AppError(
        401,
        'Current password is wrong. Please enter the correct one'
      )
    );
  }

  // 3. If true, replace old pwd with the new
  currentUser.password = newPassword;
  currentUser.confirmPassword = newPassword;
  await currentUser.save();
  // find & Update wont work as middleware wont run if update is called

  const token = jwtToken(currentUser._id);
  res.status(200).json({
    status: 'success',
    data: currentUser,
  });
};
