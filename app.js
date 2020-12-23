const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

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
