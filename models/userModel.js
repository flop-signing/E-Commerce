const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Declare the Schema of the Mongo model
const userSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'user',
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        cart: {
            type: Array,
            default: [],
        },
        address: {
            type: String,
        },
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        refreshToken: {
            type: String,
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordRestExpires: Date,
    },
    {
        timestamps: true,
    }
);
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.isMatchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createPasswordResetToken = async function () {
    const resettoken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resettoken).digest('hex');
    this.passwordRestExpires = Date.now() + 30 * 60 * 1000; // 10 minutes.
    return resettoken;
};
// Export the model
module.exports = mongoose.model('User', userSchema);
