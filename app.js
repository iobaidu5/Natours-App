const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const helmet = require('helmet');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');


const app = express();
 
app.use(express.json({ limit: '10kb'}));

// Data sanitization again NOSQL query Injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent Paramer pollution
app.use(hpp({
    whitelist: [
      'duration',
      "ratingsQuantity",
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
}));


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request, Pleasre try again in an hour"
});
app.use('/api', limiter);

// set security HTTP headers
app.use(helmet());

app.use(express.static(`${__dirname}/public`));

// 1) MIDDLEWARES
// app.use('/api/v1/tours',(req,res,next) => {
//     console.log("Hello From Middleware");
//     next();
// });

// app.use('/api/v1/tours', (req,res,next) => {
//      req.requestedTime = new Date().toISOString();
//      next();
// });

// // GET Request
// app.get('/api/v1/tours',getAllTours);
// // GET request for Specific ID
// app.get('/api/v1/tours/:id', getTour);
// // POST Request
// app.post('/api/v1/tours', createTour);
// // PATCH Request
// app.patch('/api/v1/tours/:id', updateTour);
// // DELETE Request
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req,res,next) => {
  // const err = new Error(`Cant Find ${req.originalUrl} on this server`);
  // err.status = "Fail";
  // err.statusCode = 404;

  next(new AppError(`Cant Find ${req.originalUrl} on this server`, 400));
});

app.use(globalErrorHandler);

module.exports = app;
