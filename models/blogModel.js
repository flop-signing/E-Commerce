const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        numViews: {
            type: Number,
            default: 0,
        },
        isLiked: {
            type: Boolean,
            default: false,
        },
        isDisliked: {
            type: Boolean,
            default: false,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        dislikes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        // image: {
        //     type: String,
        //     default:
        //         'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fblogging&psig=AOvVaw0M9-LBZ_fWgSfAZYz1lp05&ust=1690739837389000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCNi6t_C-tIADFQAAAAAdAAAAABAE',
        // },
        author: {
            type: String,
            default: 'Admin',
        },
        images: [],
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
        timestamps: true,
    },
);

// Export the model
module.exports = mongoose.model('Blog', blogSchema);
