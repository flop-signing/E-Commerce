const mongoose = require('mongoose');

const dbConnect = () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            family: 4,
        });
        console.log('Database Connection Successfully.');
    } catch {
        console.log('Database Error.');
    }
};

module.exports = dbConnect;
