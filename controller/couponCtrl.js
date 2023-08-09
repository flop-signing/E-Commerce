const asyncHandler = require('express-async-handler');
const Coupon = require('../models/couponModel');
const validateMongodbId = require('../utils/validateMongodbid');

// Create Coupon:
const createCoupon = asyncHandler(async (req, res) => {
    try {
        const newCoupon = await Coupon.create(req.body);
        res.json(newCoupon);
    } catch (error) {
        throw new Error(error);
    }
});
// get All Coupons

const getAllCoupon = asyncHandler(async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json(coupons);
    } catch (error) {
        throw new Error(error);
    }
});
// Update Coupon

const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatecoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatecoupon);
    } catch (error) {
        throw new Error(error);
    }
});
// Delete a Coupon
const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        res.json(deletedCoupon);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createCoupon,
    getAllCoupon,
    updateCoupon,
    deleteCoupon,
};
