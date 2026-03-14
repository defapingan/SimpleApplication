var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var https = require('https');
var fs = require('fs');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  if (req.secure || req.hostname === 'localhost' || req.hostname === '127.0.0.1') {
    next();
  } else {
    // repoint to HTTPS
    res.redirect('https://' + req.headers.host + req.url);
  }
});

app.use('/', indexRouter);

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

// run HTTPS server
try {
  const options = {
    key: fs.readFileSync('/home/ec2-user/server.key'),
    cert: fs.readFileSync('/home/ec2-user/server.cert')
  };

  https.createServer(options, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });
} catch (error) {
  console.error('Failed to start HTTPS server:', error.message);
  console.log('Falling back to HTTP only');
}

// initial HTTP server
var PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});

module.exports = app;