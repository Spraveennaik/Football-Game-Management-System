var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var expressValidator = require('express-validator');
var passport = require('passport');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var	fileUpload = require('express-fileupload');
/*var busboy = require('connect-busboy');
var fs = require('fs');
*/
var bodyParser = require('body-parser');


const con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "mydb" 
});



/* GET home page. */
router.get('/', function(req, res, next) {
	console.log(req.user);
	console.log(req.isAuthenticated());
  res.render('index', { title: 'Express' });
});

router.get('/g', function(req, res, next) {
  res.render('error', { title: 'Express' });
});


router.get('/register', function(req, res, next) {
  res.render('register', { 
  	title: 'Register',
  	errors : ''
  	});
});

router.post('/register', function(req, res, next) {

	req.checkBody('username','Username field cannot be empty').notEmpty();
	req.checkBody('email','email you entered in invalid').isEmail();
	req.checkBody('password','password must be 8-10 characters long').len(8,100)
	req.checkBody('confirmpassword','password do not match').equals(req.body.password);


	const errors = req.validationErrors();

	if(errors){
		console.log(`errors: ${JSON.stringify(errors)}`);
		
		res.render('register', { 
			title: 'Register Error',
			errors : errors
			    });
			}
	else{
		const username = req.body.username;
		const email = req.body.email;
		const password = req.body.password;
		
	//	console.log('FIRST TEST: ' + JSON.stringify(req.files));
   	//	console.log('second TEST: ' + req.files.image.name);
   	if (!req.files)
    return res.status(400).send('No files were uploaded.');
  
	var file = req.files.sampleFile;
  	var image_name = file.name;
  	console.log(image_name);
  // Use the mv() method to place the file somewhere on your server

	file.mv('public/images/upload_images/'+file.name, function(err) {
                             
	     if (err)
 			return res.status(500).send(err);

		bcrypt.hash(password,saltRounds,function(err,hash){
		con.query('INSERT INTO users(username,email,password,image)VALUES(?,?,?,?)', [username, email, password,image_name], 
		function(error,results,fields){
			if(error) throw error;

			con.query('SELECT LAST_INSERT_ID() as user_id',function(error,results,fields){
				if(error) throw error;

				const user_id = results[0];
				console.log(results[0]);

				req.login(user_id,function(err){
					res.render('index', { 
					title: 'Home'
			     });
				});
					
			});
		});
	 });
	});
   }
});	
 


router.get('/profile',authenticationMiddleware(), function(req, res, next) {
  res.render('profile', { title: 'profile' });
});

router.get('/pwd',authenticationMiddleware(), function(req, res, next) {
  res.render('password', { title: 'password' });
}); 
		


router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('/upload', function(req, res, next) {
  res.render('upload', { title: 'Upload' });
});


router.post('/upload', function(req, res, next) {
	if (!req.files)
    return res.status(400).send('No files were uploaded.');
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  var file = req.files.sampleFile;
  console.log(file);
  // Use the mv() method to place the file somewhere on your server

	file.mv('public/images/upload_images/'+file.name, function(err) {
                             
	     if (err)
 			return res.status(500).send(err);
});


  res.render('upload', { title: 'Upload' });
});

router.post('/login',passport.authenticate('local',{
	successRedirect : '/profile',
	failureRedirect : '/login'
}));

router.get('/logout', function(req, res, next) {
	req.logout();
	req.session.destroy();
 	res.redirect('/');
});

router.get('/event',function(req,res,next){

con.query("select * from e_events order by e_id ASC", function(err,result){
	
			res.render('event',{
			siteTitle : "surf",
			pageTitle : "Event list",
			items : result
		});
	});

});

passport.serializeUser(function(user_id,done){
	done(null,user_id);
});

passport.deserializeUser(function(user_id,done){
	done(null,user_id);
});

function authenticationMiddleware(){
	return(req,res,next) => {
		console.log(`req.session.passport.user: $(JSON.stringify(req.session.passport)}`);

		if(req.isAuthenticated()) return next();
		res.redirect('/login')
	}
}

module.exports = router;
