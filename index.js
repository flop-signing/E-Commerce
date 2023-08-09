const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const dbConnect = require('./config/dbConnect');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
dotenv.config();
const PORT = process.env.PORT || 4000;
const authRouter = require('./routes/authRoute');
const productRouter = require('./routes/productRoute');
const blogRouter = require('./routes/blogRoute');
const categoryRouter = require('./routes/productCategoryRoute');
const blogCategoryRouter = require('./routes/blogCatRoute');
const brandRouter = require('./routes/brandRoute');
const couponRouter = require('./routes/couponRoute');

app.use(morgan('dev')); // get the information type of request

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
dbConnect();

app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/api/blog', blogRouter);
app.use('/api/category', categoryRouter);
app.use('/api/blogcategory', blogCategoryRouter);
app.use('/api/brand', brandRouter);
app.use('/api/coupon', couponRouter);

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`The server has started on PORT ${PORT}`);
});
