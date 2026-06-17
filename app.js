var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index'); //indexRouter는 /routes/index 에 있는 것 불러와라
var usersRouter = require('./routes/users'); //usersRouter는 /routes/users 에 있는 것 불러와라

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter); //기본 경로로 시작하는 요청은 index 라우터 실행해라
app.use('/users', usersRouter); // users로 시작하는 요청이면 usersRouter에 저장된 경로 시작해라
app.use('/haksa', require('./routes/haksa')); // haksa 요청이면 haksa 라우터 불러와라
app.use('/posts', require('./routes/posts')) // posts 요청이면 posts 라우터 불러와라
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

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
