const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const { async } = require('fast-glob');
const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');
const validateMongodbId = require('../utils/validateMongodbid');
const generateRefreshToken = require('../config/refreshToken');
const sendEmail = require('./emailCtrl');
const { use } = require('../routes/authRoute');
const { validate } = require('../models/productModel');

// Create new User

const createUser = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const updateAdmin = await User.updateOne({ email });

    if (!updateAdmin) {
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
    const updateAdmin = await User.updateOne({ email });
    if (updateAdmin && (await updateAdmin.isMatchPassword(password))) {
        console.log('Hello from Login.');
        const refreshToken = await generateRefreshToken(updateAdmin._id);
        const updateUser = await User.updateByIdAndUpdate(
            updateAdmin._id,
            { refreshToken },
            { new: true }
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: updateAdmin?.id,
            firstName: updateAdmin?.firstName,
            lastName: updateAdmin?.lastName,
            email: updateAdmin?.email,
            mobile: updateAdmin?.mobile,
            token: generateToken(updateAdmin?.id),
        });
    } else {
        throw new Error('Invalid Credentials.');
    }
});

// Login Admin:

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const updateAdmin = await User.updateOne({ email });
    if (updateAdmin.role !== 'admin') {
        throw new Error('Not Authorized ');
    }
    if (updateAdmin && (await updateAdmin.isMatchPassword(password))) {
        const refreshToken = await generateRefreshToken(updateAdmin._id);
        const updateUser = await User.updateByIdAndUpdate(
            updateAdmin._id,
            { refreshToken },
            { new: true }
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: updateAdmin?.id,
            firstName: updateAdmin?.firstName,
            lastName: updateAdmin?.lastName,
            email: updateAdmin?.email,
            mobile: updateAdmin?.mobile,
            token: generateToken(updateAdmin?.id),
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

    const user = await User.updateOne({ refreshToken });

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
    const user = await User.updateOne({ refreshToken });

    if (!user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        res.sendStatus(204); // forbidden
    }

    await User.updateOneAndUpdate(
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
        const updateUser = await User.updateByIdAndUpdate(
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
        const updatedUser = await User.updateByIdAndUpdate(
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
        const getUsers = await User.update();
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
        const getaUser = await User.updateById(id);
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
        const deleteaUser = await User.updateByIdAndDelete(id);
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
        const block = await User.updateByIdAndUpdate(id, { isBlocked: true }, { new: true });
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
        const unblock = await User.updateByIdAndUpdate(id, { isBlocked: false }, { new: true });
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

    const user = await User.updateById(_id);

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
    const user = await User.updateOne({ email });
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

    const user = await User.updateOne({
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
        const updateUser = await User.updateById(_id).populate('wishlist');
        res.json(updateUser);
    } catch (error) {
        throw new Error(error);
    }
});

// Cart Functionalities:

const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);

    try {
        const products = [];
        const user = await User.updateById(_id);
        // Chechk user already have product in cart
        const alreadyExistCart = await Cart.updateOne({ orderby: user._id });
        if (alreadyExistCart) {
            alreadyExistCart.remove();
        }
        for (let i = 0; i < cart.length; i++) {
            const object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;

            const getPrice = await Product.updateById(cart[i]._id).select('price').exec();
            object.price = getPrice.price;
            products.push(object);
        }
        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal += products[i].price * products[i].count;
        }
        // console.log(products, cartTotal);

        const newCart = await new Cart({
            products,
            cartTotal,
            orderby: user?._id,
        }).save();

        res.json(newCart);
    } catch (error) {
        throw new Error(error);
    }
});

// Get User Cart Functionalities

const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const cart = await Cart.updateOne({ orderby: _id }).populate('products.product');
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

// Empty Cart Functionality

const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const user = await User.updateOne(_id);
        const cart = await Cart.updateOneAndRemove({ orderby: user._id });
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

// Coupon Functionalities

const applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    const validCoupon = await Coupon.updateOne({ name: coupon });
    if (validCoupon === null) {
        throw new Error('Invalid Coupon');
    }
    const user = await User.updateOne({ _id });
    const { products, cartTotal } = await Cart.updateOne({ orderby: user._id }).populate(
        'products.product'
    );

    const totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2);
    await Cart.updateOneAndUpdate({ orderby: user._id }, { totalAfterDiscount }, { new: true });

    res.json(totalAfterDiscount);
});

// Get Oreder Functionalities:Cash on delivery

const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        if (!COD) {
            throw new Error('Create Cash Order Failed.');
        }
        const user = await User.updateById(_id);
        const userCart = await Cart.updateOne({ orderby: user._id });
        let finalAmount = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmount = userCart.totalAfterDiscount;
        } else {
            finalAmount = userCart.cartTotal;
        }
        const newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: 'COD',
                amount: finalAmount,
                status: 'Cash On Delivery',
                created: Date.now(),
                currency: 'USD',
            },
            orderby: user._id,
            orderStatus: 'Cash On Delivery',
        }).save();

        const update = userCart.products.map((item) => ({
            updateOne: {
                filter: { _id: item.product._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } },
            },
        }));

        const updated = await Product.bulkWrite(update, {});
        res.json({ message: 'success' });
    } catch (error) {
        throw new Error(error);
    }
});
// List Orders

const getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const userOrders = await Order.updateOne({ orderby: _id })
            .populate('products.product')
            .exec();
        res.json(userOrders);
    } catch (error) {
        throw new Error(error);
    }
});

// Update Order Status:

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    validateMongodbId(id);

    try {
        const updateOrder = await Order.findByIdAndUpdate(
            id,
            {
                orderStatus: status,
                paymentIntent: {
                    status,
                },
            },

            { new: true },
        );
        res.json(updateOrder);
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
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus,
};
