const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const { request } = require('express');
const { type } = require('doctrine');
const fs = require('fs');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const validateMongodbId = require('../utils/validateMongodbid');
const cloudinaryUploadImg = require('../utils/cloudinary');

// Create Product
const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);

        res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
});
// Update a PRODUCT

const updateaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updateProduct = await Product.findByIdAndUpdate({ _id: id }, req.body, { new: true });
        res.json(updateProduct);
    } catch (error) {
        throw new Error(error);
    }
});
// DELETE A PRODUCT
const deleteaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const deleteProduct = await Product.findOneAndDelete({ _id: id });
        res.json(deleteProduct);
    } catch (error) {
        throw new Error(error);
    }
});
// Get a Product

const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } catch (error) {
        throw new Error(error);
    }
});

// Get All Products
const getAllProduct = asyncHandler(async (req, res) => {
    try {
        // Filtering

        const queryObj = { ...req.query };

        const excludeFields = ['page', 'sort', 'limit', 'field'];
        excludeFields.forEach((el) => {
            delete queryObj[el];
        });

        let queryStr = JSON.stringify(queryObj);

        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // flag g indicates it match with the all thing.
        // console.log(queryStr);
        // console.log(JSON.parse(queryStr));

        let query = Product.find(JSON.parse(queryStr));
        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' '); // ?sort=category,brand
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt'); // ? sort=-category
        }

        // Limitting the fields
        if (req.query.fields) {
            const find = req.query.fields.split(',').join(' ');
            query = query.select(`-${find}`);
        } else {
            query = query.select('-__v'); // we don't want to show this to user
        }

        // Pagination
        const { page } = req.query;
        const { limit } = req.query;
        const skip = (page - 1) * limit;
        // console.log(page, limit, skip);
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) {
                throw new Error('This page does not exists.');
            }
        }
        // console.log(page, limit, skip);

        const product = await query;
        res.json(product);
    } catch (error) {
        throw new Error(error);
    }
});
// Wishlist Functionalities:
const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);

        if (alreadyAdded) {
            const findUser = await User.findByIdAndUpdate(
                _id,
                {
                    $pull: { wishlist: prodId },
                },
                { new: true },
            );
            res.json(findUser);
        } else {
            const findUser = await User.findByIdAndUpdate(
                _id,
                {
                    $push: { wishlist: prodId },
                },
                { new: true },
            );
            res.json(findUser);
        }
    } catch (error) {
        throw new Error(error);
    }
});

// Rating Functionalities:

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    console.log(star, prodId);

    try {
        // console.log('totalRatings');
        const product = await Product.findById(prodId);
        // console.log(product);
        const alreadyRated = product.ratings.find(
            (userId) => userId.postedby.toString() === _id.toString(),
        );

        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                {
                    ratings: {
                        $elemMatch: alreadyRated,
                    },
                },
                {
                    $set: { 'ratings.$.star': star, 'ratings.$.comment': comment },
                },
                { new: true },
            );
        } else {
            const rateProduct = await Product.findByIdAndUpdate(
                prodId,
                {
                    $push: {
                        ratings: {
                            star,
                            comment,
                            postedby: _id,
                        },
                    },
                },
                { new: true },
            );
        }

        const getAllRatings = await Product.findById(prodId);
        const totalRatings = getAllRatings.ratings.length;

        const ratingSum = getAllRatings.ratings
            .map((item) => item.star)
            .reduce((prev, current) => prev + current, 0);

        const actualRating = Math.round(ratingSum / totalRatings);

        const finalProduct = await Product.findByIdAndUpdate(
            prodId,
            {
                totalrating: actualRating,
            },
            { new: true }
        );
        res.json(finalProduct);
    } catch (error) {
        throw new Error(error);
    }
});

// Upload Images:

const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    // console.log(req.files);
    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'images');
        const urls = [];
        const { files } = req;
        for (const file of files) {
            const { path } = file;
            const newPath = await uploader(path);
            urls.push(newPath);
            fs.unlinkSync(path);
        }

        const findProduct = await Product.findByIdAndUpdate(
            id,

            {
                images: urls.map((file) => file),
            },

            { new: true }
        );
        // console.log(findProduct);
        res.json(findProduct);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createProduct,
    getaProduct,
    getAllProduct,
    updateaProduct,
    deleteaProduct,
    addToWishlist,
    rating,
    uploadImages,
};
