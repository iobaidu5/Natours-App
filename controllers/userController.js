const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req,res, next) => { 
  const users = await User.find(); // EXECUTE QUERY   

  res.status(200).json({
      status: "success",
      results: users.length,
      data: {
          users
      }
  });   
});

exports.createUser = (req,res) => {
  res.status(500).json({
      success: "failed",
      msg: "User not Found"
  });
}

exports.getUser = (req,res) => {
  res.status(500).json({
      success: "failed",
      msg: "User not Found"
  });
}
exports.updateUser = (req,res) => {
  res.status(500).json({
      success: "failed",
      msg: "User not Found"
  });
}
exports.deleteUser = (req,res) => {
  res.status(500).json({
      success: "failed",
      msg: "User not Found"
  });
}