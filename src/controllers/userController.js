const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// Multer configuration
// store image in disk
// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// store image in buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError(401, 'Only image files allowed'));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizePhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg `;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

exports.getAll = async (req, res, next) => {
  const users = await User.find();

  if (!users) return next(new AppError(404, 'There are no active users.'));

  res.status(200).json({
    status: 'success',
    data: users,
  });
};

exports.getOne = async (req, res, next) => {

  const user = await User.findOne({ _id: req.user._id });
  if (!user)
    return next(new AppError(404, 'No user found for this email address'));

  res.status(200).json({
    status: 'success',
    data: user,
  });
};

exports.updateMe = async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        401,
        'Please update password by logging in and visiting your profile.'
      )
    );
  }

  let user = await User.findOne({ email: req.user.email });

  if (req.body.name) user.name = req.body.name;
  if (req.body.bio) user.bio = req.body.bio;
  if (req.file) user.photo = `public/img/users/${req.file.filename}`;

  user = await User.findByIdAndUpdate(user._id, user);

  res.status(200).json({
    status: 'success',
    data: user,
  });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    { _id: req.body.id },
    { isActive: false }
  );

  res.status(200).json({
    status: 'success',
    data: user,
  });
};

