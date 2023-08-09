const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const { async } = require('fast-glob');
const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const validateMongodbId = require('../utils/validateMongodbid');
const generateRefreshToken = require('../config/refreshToken');
const sendEmail = require('./emailCtrl');
const { use } = require('../routes/authRoute');
const { validate } = require('../models/productModel');

// Create new User

const createUser = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const findAdmin = await User.findOne({ email });

    if (!findAdmin) {
        // create new user
        const newUser = await User.create(req.body);
        res.status(200).json(newUser);
    } else {
        // User already exists.
        throw new Error('User Already Exists.');
    }
});

// Login User

const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findAdmin = await User.findOne({ email });
    if (findAdmin && (await findAdmin.isMatchPassword(password))) {
        console.log('Hello from Login.');
        const refreshToken = await generateRefreshToken(findAdmin._id);
        const updateUser = await User.findByIdAndUpdate(
            findAdmin._id,
            { refreshToken },
            { new: true }
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findAdmin?.id,
            firstName: findAdmin?.firstName,
            lastName: findAdmin?.lastName,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?.id),
        });
    } else {
        throw new Error('Invalid Credentials.');
    }
});

// Login Admin:

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findAdmin = await User.findOne({ email });
    if (findAdmin.role !== 'admin') {
        throw new Error('Not Authorized ');
    }
    if (findAdmin && (await findAdmin.isMatchPassword(password))) {
        const refreshToken = await generateRefreshToken(findAdmin._id);
        const updateUser = await User.findByIdAndUpdate(
            findAdmin._id,
            { refreshToken },
            { new: true }
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findAdmin?.id,
            firstName: findAdmin?.firstName,
            lastName: findAdmin?.lastName,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?.id),
        });
    } else {
        throw new Error('Invalid Credentials.');
    }
}); // Handle Refresh Token

const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    // console.log(cookie);

    if (!cookie.refreshToken) {
        throw new Error('No Refresh Token in cookies.');
    }
    const { refreshToken } = cookie;
    // console.log(refreshToken);

    const user = await User.findOne({ refreshToken });

    if (!user) {
        throw new Error('No RefreshToken present in db or not matched.');
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error('There is something wrong with refresh token.');
        }

        const accessToken = generateToken(user?._id);
        res.json({ accessToken });
    });
});

// Logout Functionalities:

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) {
        throw new Error('No Refresh Token in Cookies.');
    }
    const { refreshToken } = cookie;
    const user = await User.findOne({ refreshToken });

    if (!user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        res.sendStatus(204); // forbidden
    }

    await User.findOneAndUpdate(
        { refreshToken },
        {
            refreshToken: '',
        }
    );

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    });
    res.sendStatus(204);
});

// Update User

const updateaUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    validateMongodbId(id);
    try {
        const updateUser = await User.findByIdAndUpdate(
            id,
            {
                firstName: req?.body?.firstName,
                lastName: req?.body?.lastName,
                email: req?.body?.email,
                mobile: req?.body?.mobile,
            },
            { new: true },
        );

        res.json(updateUser);
    } catch (error) {
        throw new Error(error);
    }
});

// Save User Address

const saveAddress = asyncHandler(async (req, res, next) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                address: req?.body?.address,
            },
            { new: true },
        );
        res.json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }
});

// get all users:

const getAllUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    } catch (error) {
        throw new Error(error);
    }
});

// get a single user.

const getaUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    validateMongodbId(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        });
    } catch (error) {
        throw new Error(error);
    }
});

// Delete an user
const deleteaUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    validateMongodbId(id);
    try {
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        });
    } catch (error) {
        throw new Error(error);
    }
});

// block User:

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    validateMongodbId(id);
    try {
        const block = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
        res.json({
            message: 'User Blocked',
        });
    } catch (error) {
        throw new Error(error);
    }
});
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    validateMongodbId(id);
    try {
        const unblock = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
        res.json({
            message: 'User UnBlocked',
        });
    } catch (error) {
        throw new Error(error);
    }
});
// Update Password:

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    // console.log(password);
    validateMongodbId(_id); // validate the user

    const user = await User.findById(_id);

    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
});
// Forgot Password

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('There is no user with this email.');
    }

    try {
        const token = await user.createPasswordResetToken();
        await user.save();

        const resetURL = `Hi, Please Follow this link to reset your password.This link is valid til 10 minutes from now. <a href='http://localhost:3000/api/user/reset-password/${token}'>Click Here.</a>`;

        const data = {
            to: email,
            text: 'Hey User.',
            subject: 'Forgot Password Link.',
            html: resetURL,
        };
        sendEmail(data);
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
});
// Reset Password

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordRestExpires: { $gt: Date.now() },
    });

    if (!user) {
        throw new Error('Token Expired,Please Try Again.');
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordRestExpires = undefined;
    await user.save();
    res.json(user);
});

// Wishlist

const getWishList = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    try {
        const findUser = await User.findById(_id).populate('wishlist');
        res.json(findUser);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createUser,
    loginUserCtrl,
    getAllUser,
    getaUser,
    deleteaUser,
    updateaUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishList,
    saveAddress,
};
