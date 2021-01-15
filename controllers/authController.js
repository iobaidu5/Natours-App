// eslint-disable-next-line import/no-unresolved
const crypto = require('crypto');
const { promisify }  = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: "Success",
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req,res,next) => {
    const newUser = await User.create(req.body);
    createSendToken(newUser, 201, res);
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
    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req,res,next) => {
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

exports.forgetPassword = catchAsync(async (req,res,next) => {
    //1) Get user post on POSTed email
    const user = await User.findOne({email: req.body.email});
    if(!user) {
        return next(new AppError("No user with this E-mail", 404));
    }

    //2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3) Send a user's email
    const resetURL = `${req.protocol}://${req.get}('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot Password? Submit a Patch Request with new Password and confirm to: ${resetURL}.\n If you didnt forgot password, Please ignore this mail`;

    try{
        await sendEmail({
            email: user.email,
            subject: 'Your Password Token valid for 10 mints',
            message
        });
    
        res.status(200).json(
            {
                status: 'Success',
                message: 'Token send to email'
            }
        );

    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError("There was error in Sending Email, Try Again Later", 500));
    }
    
});

exports.resetPassword = catchAsync(async (req,res,next) => {

    //1) Get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired there is user, set new password
    if(!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 3) Update changedpasswordAt
    // 4) Log the user in, Send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req,res,next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    //2) Check if POSTed current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current Password is Wrong', 401));
    } 

    // 3) If so, update Password
    user.passwod = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log User, send JWT
    createSendToken(user, 200, res);

})