const asyncHandler = require('express-async-handler');
const Brand = require('../models/brandModel');
const validateMongodbId = require('../utils/validateMongodbid');
// Create Brand
const createBrand = asyncHandler(async (req, res) => {
    try {
        const newBrand = await Brand.create(req.body);
        res.json(newBrand);
    } catch (error) {
        throw new Error(error);
    }
});

// Update Brand

const updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedBrand);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete Brand

const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedBrand = await Brand.findByIdAndDelete(id);
        res.json(deletedBrand);
    } catch (error) {
        throw new Error(error);
    }
});

// Fetch a Brand

const getaBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getBrand = await Brand.findById(id);
        res.json(getBrand);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all the Brand

const getAllBrand = asyncHandler(async (req, res) => {
    try {
        const getallBrand = await Brand.find();
        res.json(getallBrand);
    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {
    createBrand,
    updateBrand,
    deleteBrand,
    getaBrand,
    getAllBrand,
};
