var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var crypto = require('crypto');
global.cfg=require("./appCfg");
global.query=require("./position0510");

global.splitPage = function(queryObj){
  var pageInfo = {};
  if(typeof queryObj === "object" && queryObj.page){
    pageInfo.limit = parseInt(queryObj.pageSize);
    pageInfo.offset = (queryObj.page - 1) * pageInfo.limit;
    delete queryObj.page;
    delete  queryObj.pageSize;
  }
  return pageInfo;
}

global.md5 = function(text){
  return crypto.createHash('md5').update(text).digest('hex');
}

global.dealError = function(err,res,isSend){
     if(isSend.status) return;
     isSend.status = true;
     res.send("0");
}

var app = express();
//设置跨域访问
app.all('*',function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});
app.use(compression({filter: shouldCompress}))
//引入compression中间件对请求响应数据进行gzip压缩
function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }
  // fallback to standard filter function
  return compression.filter(req, res)
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false,limit:"10000kb"}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var sessionStore = new MySQLStore(global.cfg);
app.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  store: sessionStore,
  resave: true,
  saveUninitialized: false
}));

var mvc=require("mvc");
var orm = require('orm');
//var transaction = require("orm-transaction");
app.use(orm.express(global.cfg.dbUrl, {
    define: function (db, models, next) {
        app.locals.db=db;
        //db.use(transaction);
        mvc.defineModules(db,models);
        next();
    }
}));
// app.use(orm.express(global.cfg.manageDbUrl, {
//     define: function (db, models, next) {
//         app.locals.db=db;
//         //db.use(transaction);
//         mvc.defineModules(db,models,"manage_models");
//         next();
//     }
// }));
var login=require("./loginmiddle");
app.use(login());
login.gateWay(app);
mvc.defineRoutes(app);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
module.exports = app;