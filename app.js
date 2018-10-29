var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var http = require('http');
var session = require('express-session');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var MySQLStore = require('express-mysql-session')(session);
var bcrypt = require('bcrypt');
//var	busboy = require("connect-busboy");
var	fileUpload = require('express-fileupload');
var fs = require('fs');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb"
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use('/pjs',express.static(path.join(__dirname + '/node_modules/bootstrap/dist/js')));
app.use('/pjs',express.static(path.join(__dirname + '/node_modules/tether/dist/js')));
app.use('/pjs',express.static(path.join(__dirname + '/node_modules/jquery/dist/js')));
app.use('/pcss',express.static(path.join(__dirname + '/node_modules/bootstrap/dist/css')));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
//app.use(busboy());


var options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'mydb'
};

var sessionStore = new MySQLStore(options);

app.use(session({
  secret: 'ewhfjjbjegnfvnb',
  resave: false,
  store: sessionStore,
  saveUninitialized: false,
 // cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(expressValidator());

app.use(function(req,res,next){
	res.locals.isAuthenticated = req.isAuthenticated();
	next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);


/*

passport.use(new localStrategy(
	function(username,password,done){
	//	console.log(username);
	//	console.log(password);

		con.query('SELECT Mid,password FROM manager WHERE username = ?',[username],function(err,results,fields){
			if(err) {done(err)};

			if(results.length === 0){
				done(null,false);
			}else{

			const hash = results[0].password.toString();
			//console.log(hash);

			var n = hash.localeCompare(password);

			if(n==0){
				return done(null, {user_id : results[0].Mid});
			}else{
				return done(null,false);
			}
		}

		})
	}
));

*/
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

var server = app.listen(5000,function(){
	console.log("server started at 5000");
});
