const express = require('express');
const {
    createProduct,
    getaProduct,
    getAllProduct,
    updateaProduct,
    deleteaProduct,
    addToWishlist,
    rating,
    uploadImages,
} = require('../controller/productCtrl');

const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { uploadPhoto, porductImageResize } = require('../middlewares/uploadImages');

const router = express.Router();

router.post('/', authMiddleware, isAdmin, createProduct);
router.put(
    '/upload/:id',
    authMiddleware,
    isAdmin,
    uploadPhoto.array('images', 10),
    porductImageResize,
    uploadImages,
);
router.get('/:id', getaProduct);
router.put('/wishlist', authMiddleware, addToWishlist);
router.put('/rating', authMiddleware, rating);
router.get('/', getAllProduct);
router.put('/:id', authMiddleware, isAdmin, updateaProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteaProduct);
module.exports = router;
