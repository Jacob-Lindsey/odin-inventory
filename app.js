var createError = require('http-errors');
var express = require('express');
var async = require('async');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var Category = require('./models/category');

var app = express();
app.use(logger('dev'));

var mongoose = require('mongoose');
var mongoDB = 'mongodb+srv://pantzzzz:jakejake@cluster0.bjfcc.mongodb.net/inventory?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

var catDetails = function(callback) {
  Category.find().exec(callback);
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

/* app.use(function (req, res, next) {
  async.parallel(
      res.locals.categories = function(callback) {
          Category.find().exec(callback);
      }
  )
  console.log('Middleware working');
});
 */
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
