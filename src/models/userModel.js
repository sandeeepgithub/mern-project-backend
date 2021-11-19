const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name field is required - be'],
  },
  email: {
    type: String,
    required: [true, 'Email cannot be empty'],
    lowercase: true,
    unique: true,
  },
  photo: {
    type: String,
    default: 'public/img/users/default.jpg',
  },
  bio: {
    type: String,
    default: 'Live, Laugh, Play',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Confirm Password is required '],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Both passwords should be same',
    },
    select: false,
  },
  role: {
    type: String,
    default: 'user',
    enum: ['admin', 'user'],
  },
  passwordChangedAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.checkPassword = async function (
  // instance method => available wherever the model is used
  loginPassword,
  originalPassword
) {
  return await bcrypt
    .compare(loginPassword, originalPassword)
    .then((res) => res);
};

userSchema.methods.isTokenValid = function (tokenInitiateTime) {
  // instance method => available wherever the model is used

  if (this.passwordChangedAt) {
    const passwordChangedTimeUnix = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return passwordChangedTimeUnix > tokenInitiateTime;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
