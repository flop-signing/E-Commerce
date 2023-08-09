const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const orderSchema = new mongoose.Schema(
    {
        products: [
            {
                product: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Product',
                },
                count: Number,
                color: String,
            },
        ],
        paymentIntent: {},
        orderStatus: {
            type: String,
            default: 'Not Processed',
            enum: [
                'Not Processed',
                'Cash On Delivery',
                'Processing',
                'Dispatched',
                'Cancelled',
                'Delivered',
            ],
        },
        orderby: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
    },
    { timeseries: true },
);

// Export the model
module.exports = mongoose.model('Order', orderSchema);
