const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRouts');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoute');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1)GLOBAL MIDDLEWARES
//Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//set security HTTP header
app.use(helmet());

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from IP, please try again in an hur'
});

app.use('/api', limiter);

//BODY PARSER, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Date sanitazation agains noSql query injection
app.use(mongoSanitize());

//data sanitazation agains XSS
app.use(xss());

//prevent paramatre pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
