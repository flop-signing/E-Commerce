const asyncHandler = require('express-async-handler');
const { async } = require('fast-glob');
const fs = require('fs');
const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const validateMongodbId = require('../utils/validateMongodbid');
const cloudinaryUploadImg = require('../utils/cloudinary');

// Create New Blog:

const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);
    } catch (error) {
        throw new Error(error);
    }
});

// Update Blog

const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
        res.json(blog);
    } catch (error) {
        throw new Error(error);
    }
});

// Fetch A blog

const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
        const getaBlog = await Blog.findById(id).populate('likes').populate('dislikes');
        const updateViews = await Blog.findByIdAndUpdate(
            id,
            { $inc: { numViews: 1 } },
            { new: true }
        );
        res.json(getaBlog);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all Blogs

const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const getAllBlocks = await Blog.find();
        res.json(getAllBlocks);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a Blog:

const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deleteaBlog = await Blog.findByIdAndDelete(id);
        res.json(deleteaBlog);
    } catch (error) {
        throw new Error(error);
    }
});

// Like Functionalities

const likeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongodbId(blogId);

    // Find the Block which you want to be  liked
    let blog = await Blog.findById(blogId);
    // Find the Login User
    const loginUserId = req?.user?._id;
    // If the user has like the blog
    const isLiked = blog?.isLiked;

    // Find if the user has disliked the blog

    const alreadyDisliked = blog?.dislikes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyDisliked) {
        blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId },
                isDisLiked: false,
            },
            { new: true },
        );
        res.json(blog);
    }

    if (isLiked) {
        blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId },
                isLiked: false,
            },
            { new: true },
        );
        res.json(blog);
    } else {
        blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { likes: loginUserId },
                isLiked: true,
            },
            { new: true },
        );
        res.json(blog);
    }
});

// Dislike Blog Functionalities
const dislikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongodbId(blogId);

    // Find the Block which you want to be  liked
    let blog = await Blog.findById(blogId);
    // Find the Login User
    const loginUserId = req?.user?._id;
    // If the user has like the blog
    const isDisLiked = blog?.isDisliked;

    // Find if the user has disliked the blog

    const alreadyLiked = blog?.likes.find(
        (userId) => userId?.toString() === loginUserId?.toString(),
    );

    if (alreadyLiked) {
        blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId },
                isLiked: false,
            },
            { new: true }
        );
        res.json(blog);
    }

    if (isDisLiked) {
        blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId },
                isDisliked: false,
            },
            { new: true }
        );
        res.json(blog);
    } else {
        blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { dislikes: loginUserId },
                isDisliked: true,
            },
            { new: true }
        );
        res.json(blog);
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

        const findBlog = await Blog.findByIdAndUpdate(
            id,

            {
                images: urls.map((file) => file),
            },

            { new: true }
        );

        // console.log(findBlog);

        res.json(findBlog);
    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {
    createBlog,
    updateBlog,
    getBlog,
    getAllBlogs,
    deleteBlog,
    likeBlog,
    dislikeBlog,
    uploadImages,
};
