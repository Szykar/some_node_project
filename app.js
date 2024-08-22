const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const routes = require('./routes/index');
const users  = require('./routes/users');
const sessions  = require('./routes/sessions');
const session_parts  = require('./routes/session-parts');
const votings  = require('./routes/votings');
const groups  = require('./routes/groups');

const models = require('./models');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var SequelizeStore = require("connect-session-sequelize")(session.Store);

app.use(session({
  store: new SequelizeStore({
    db: models.sequelize,
    modelKey: 'AppSession',
    tableName: 'AppSessions'
  }),
  key: 'user_sid',
  secret: process.env.APP_SESSION_SECRET || 'not-a-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 540000
  }
}));

app.use('/', routes);
app.use('/users', users);
app.use('/sessions', sessions);
app.use('/session-parts', session_parts);
app.use('/votings', votings);
app.use('/groups', groups);

const apiUrl = (process.env.NODE_ENV === 'production') ? process.env.APP_URL_PROD : process.env.APP_URL_DEV

app.get('/session/', function (req, res, next) {
  res.render('session', {apiUrl})
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// no stack traces leaked to user unless in development environment
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: (app.get('env') === 'development') ? err : {}
  });
});


module.exports = app;
