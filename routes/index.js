var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var expressValidator = require('express-validator');
var passport = require('passport');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var	fileUpload = require('express-fileupload');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
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
	//console.log(req.user);
	//console.log(req.isAuthenticated());
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
 			return res.status(500).send(err);});

		bcrypt.hash(password,saltRounds,function(err,hash){
		con.query('INSERT INTO manager(username,email,image,password)VALUES(?,?,?,?)', [username, email,image_name, password], 
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
   }
});	
 


router.get('/profile',authenticationMiddleware(), function(req, res, next) {
	if(req.user.user_id)
	{

		con.query('SELECT * FROM manager WHERE Mid = (?)',[req.user.user_id],function(err,results,fields){
			res.render('profile',{
				title : "profile",
				items : results
			});
	  	});
  	}else{
  		res.render('login', { title: 'Login' });
  	}
});


router.post('/profile', function(req, res, next) {
  
  if(req.user.user_id)
  	{	
		const firstname = req.body.first_name;
		const lastname = req.body.last_name;
		const country = req.body.country;
		const email = req.body.email;
		const age = req.body.age;


		if (req.files.sampleFile == undefined)
    		return res.status(400).send('No files were uploaded.');
    	//console.log(req.files.sampleFile.name);
    	console.log(req.files.sampleFile);

  
	/*	var file = req.files.sampleFile;
  		var image_name = file.name;

  		file.mv('public/images/upload_images/'+file.name, function(err) {
                             
	    if (err)
		return res.status(500).send(err);});
*/
  		con.query('UPDATE manager SET firstname = ?, lastname = ?, Age = ?, country = ? ,email = ? WHERE Mid = ?',[firstname,lastname,age,country,email,req.user.user_id],function(err,results){
  			if(err)
  			{
  				res.redirect('/login');
  			}
  			res.redirect('/profile');

  		});
    }
    
});

router.get('/pwd',authenticationMiddleware(), function(req, res, next) {
  res.render('password', { title: 'password' });
}); 
		


router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});
 
 router.get('/extra/12', function(req, res, next) {
  	con.query("select * from team order by TeamID ASC", function(err,result){
		res.render('extra',{
		title : "extra",
		items : result
	});
  });
});

router.get('/teams', function(req, res, next) {

	con.query("select * from team order by TeamID ASC", function(err,result){
		res.render('teams',{
		title : "Teams",
		items : result
	});
  });
});


router.get('/team/:id',function(req,res,next){

	con.query("SELECT * FROM team WHERE TeamID = '"+req.params.id+"'",function(err,result){
		var team = result[0].TName;

	con.query("SELECT * FROM player WHERE TeamID = '"+req.params.id+"'",function(err,result){


		res.render('team',{
			title : "Team",
			items : result,
			teamname : team
		});
	  });
	});
});


router.get('/player/:id',function(req,res,next){

	con.query("SELECT * FROM player WHERE Player_ID = '"+req.params.id+"'",function(err,result){
		var results2 = result;

	con.query("SELECT * FROM stats WHERE Player_ID = '"+req.params.id+"'",function(err,result){
		var results1 = result;		

		con.query("SELECT * FROM team WHERE TeamID = '"+results2[0].TeamID+"'",function(err,result){
		var team = result[0].TName;

		res.render('player',{
			title : "Player",
			items : results2,
			stat : results1,
			teamname : team
		});
	  });
	});
});
});


router.get('/player', function(req, res, next) {
  con.query("select * from player order by player_ID ASC", function(err,result){
		res.render('players',{
		title : "Players",
		items : result
	});
  });
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
