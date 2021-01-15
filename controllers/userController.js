const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find(); // EXECUTE QUERY

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async(req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password upadate, Please user /updateMyPassword',
        400
      )
    );
  }

  // 2) Update user document
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidator: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }

  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    success: 'failed',
    msg: 'User not Found',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    success: 'failed',
    msg: 'User not Found',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    success: 'failed',
    msg: 'User not Found',
  });
};

exports.deleteMe = catchAsync(async (req,res,next) => {
  await User.findByIdAndUpdate(req.body.id, {active: false});

  res.status(204).json({
    status: 'success',
    data: null
  })
});

exports.deleteUser = (req, res) => {
  res.status(500).json({
    success: 'failed',
    msg: 'User not Found',
  });
};
