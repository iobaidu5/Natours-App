// eslint-disable-next-line import/no-unresolved
const { promisify }  = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req,res,next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
        });

        const token = signToken(newUser._id);

    res.status(201).json({
        status: "success",
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async (req,res,next) => {
    const {email, password} = req.body;

    // Check if email and password exist

    if (!email || !password){
        return next(new AppError("Please provide email and password", 400));
    }

    // check if email and password is correct
   const user = await User.findOne({ email });


   if(!user || !await user.correctPassword(password, user.password)) {
       return next(new AppError("Incorrect email or password", 401));
   }

    // If Ok send token
    const token = signToken(user._id);
    res.status(200).json({
        status: "success",
        token
    }); 
});

exports.protet = catchAsync(async (req,res,next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Yor are not loggend in. Plz LogIn', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist', 401));
    }


    if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password. Please login again', 401));
    }

    req.user = currentUser;
    next();
});
 
exports.restrictTo = (...roles) => {
    return (req,res,next) => {
        if (roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action", 403));
        }

        next();
    }
}