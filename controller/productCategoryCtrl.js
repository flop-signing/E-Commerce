const asyncHandler = require('express-async-handler');
const Category = require('../models/productCategoryModel');
const validateMongodbId = require('../utils/validateMongodbid');
const { findByIdAndUpdate } = require('../models/productModel');

// Create Category

const createCategory = asyncHandler(async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        res.json(newCategory);
    } catch (error) {
        throw new Error(error);
    }
});

// Update Category

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedCategory);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete Category

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        res.json(deletedCategory);
    } catch (error) {
        throw new Error(error);
    }
});

// Fetch a category

const getaCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getCategory = await Category.findById(id);
        res.json(getCategory);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all the Category

const getAllCategory = asyncHandler(async (req, res) => {
    try {
        const getallCategory = await Category.find();
        res.json(getallCategory);
    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    getaCategory,
    getAllCategory,
};
