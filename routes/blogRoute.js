const express = require('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const {
    createBlog,
    updateBlog,
    getBlog,
    getAllBlogs,
    deleteBlog,
    likeBlog,
    dislikeBlog,
    uploadImages,
} = require('../controller/blogCtrl');
const { blogImageResize, uploadPhoto } = require('../middlewares/uploadImages');

const router = express.Router();

router.post('/create', authMiddleware, isAdmin, createBlog);
router.put(
    '/upload/:id',
    authMiddleware,
    isAdmin,
    uploadPhoto.array('images', 10),
    blogImageResize,
    uploadImages
);
router.put('/likes', authMiddleware, likeBlog);
router.put('/dislikes', authMiddleware, dislikeBlog);
router.put('/:id', authMiddleware, isAdmin, updateBlog);
router.get('/:id', getBlog);
router.get('/', getAllBlogs);
router.delete('/:id', authMiddleware, isAdmin, deleteBlog);
module.exports = router;
