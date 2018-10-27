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


var con = mysql.createConnection({
  host: "localhost",
  user: "username",
  password: "password",
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
  	errors : '',
  	message : ''
  	});
});

router.post('/register', function(req, res, next) {

	req.checkBody('username','Username field cannot be empty').notEmpty();
	req.checkBody('email','email you entered in invalid').isEmail();
	req.checkBody('password','password must be 4-100 characters long').len(4,100)
	req.checkBody('confirmpassword','password do not match').equals(req.body.password);

	const errors = req.validationErrors();

	if(errors){
		console.log(`errors: ${JSON.stringify(errors)}`);

		res.render('register', {
			title: 'Register Error',
			errors : errors,
			message : ''
			    });
			}
	else{
		const username = req.body.username;
		const email = req.body.email;
		const password = req.body.password;

   	if (!(req.files.sampleFile))
    {
    	message = "Image not Uploaded. Please upload an image";
    	res.render('register', {
			title: 'Register Error',
			errors : '',
			message : message
			    });

    }else{

	var file = req.files.sampleFile;
  	var image_name = file.name;
  	console.log(image_name);
  // Use the mv() method to place the file somewhere on your server

  	if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" ){

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
   }else{
   			message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
    		res.render('register', {
			title: 'Register Error',
			errors : '',
			message : message
		 });
   }
  }
}

});



router.get('/profile',authenticationMiddleware(), function(req, res, next) {
	if(req.user.user_id)
	{
		con.query('SELECT * FROM team WHERE Mid = (?)',[req.user.user_id],function(err,results,fields){
			var results1 = results;

		con.query('SELECT * FROM manager WHERE Mid = (?)',[req.user.user_id],function(err,results,fields){
			res.render('profile',{
				title : "profile",
				items : results,
				team : results1
			});
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


		if (!(req.files.sampleFile == undefined))
    	{
			var file = req.files.sampleFile;
  			var image_name = file.name;

  			if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" ){

  			file.mv('public/images/upload_images/'+file.name, function(err) {

	    	if (err)
			return res.status(500).send(err);});

			con.query('UPDATE manager SET image = ? WHERE Mid = ?',[image_name,req.user.user_id],function(err,results){
  			if(err)
  			{
  				res.redirect('/login');
  			}
  			});
		  }
		}
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
  res.render('password', {
   title: 'password',
   errors: '',
   message : ''
    });
});


router.post('/pwd',authenticationMiddleware(), function(req, res, next) {

  	if(req.user.user_id)
	{
		const oldpwd = req.body.oldpwd;
		const newpwd = req.body.newpwd;
		const confirmpwd = req.body.confirmpwd;

		con.query('SELECT * FROM manager WHERE Mid = (?)',[req.user.user_id],function(err,results,fields){

			const hash = results[0].password.toString();
			console.log(hash);
			console.log(oldpwd);
			var n = hash.localeCompare(oldpwd);
			console.log(n);

			if(n==0){
				req.checkBody('newpwd','password must be 4-100 characters long').len(4,100)
				req.checkBody('confirmpwd','password do not match').equals(req.body.newpwd);

				const errors = req.validationErrors();

				if(errors){
				console.log(`errors: ${JSON.stringify(errors)}`);

				res.render('password', {
					title: 'Password Error',
					errors : errors,
					message : ''
			      });
			    }
				else{
					  	bcrypt.hash(newpwd,saltRounds,function(err,hash){
						con.query('UPDATE manager SET password = ? WHERE Mid = ?',[newpwd,req.user.user_id], function(error,results,fields){
							if(error) throw error;

							res.redirect('/profile');

							});
	 					});
					}
			}else{
				var message = "Incorrect Password"
				 res.render('password', {
  					 title: 'password',
  					 errors : '',
   					message : message
   					 });
			}

	  	});

  	}else{
  		res.render('login', { title: 'Login' });
  	}
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
		var team = result;

	con.query("SELECT * FROM player WHERE TeamID = '"+req.params.id+"' ORDER BY Rating DESC",function(err,result){

		res.render('team',{
			title : "Team",
			items : result,
			team : team
		});
	  });
	});
});

router.get('/fixtures',function(req,res,next){

	con.query("SELECT * FROM team WHERE TeamID = '"+1+"'",function(err,result){
		var team1 = result;
	//	console.log(result);

	con.query("select * from (select * from player order by Rating desc)A where A.position = 'defender' and TeamID = '"+1+"' ORDER by Rating DESC limit 4;",function(err,result){
		var defender1 = result;
	//	console.log(result);

	con.query("select * from (select * from player order by Rating desc)A where A.position = 'striker' and TeamID = '"+1+"' ORDER by Rating DESC limit 3;",function(err,result){
		var striker1 = result;

	con.query("select * from (select * from player order by Rating desc)A where A.position = 'midfielder' and TeamID = '"+1+"' ORDER by Rating DESC limit 3;",function(err,result){
		var midfielder1 = result;

	con.query("select * from (select * from player order by Rating desc)A where A.position = 'goalkeeper' and TeamID = '"+1+"' ORDER by Rating DESC limit 1;",function(err,result){
		var goalkeeper1 = result;

	con.query("SELECT * FROM team WHERE TeamID = '"+2+"'",function(err,result){
		var team2 = result;
	
	con.query("select * from (select * from player order by Rating desc)A where A.position = 'defender' and TeamID = '"+2+"' ORDER by Rating DESC limit 4;",function(err,result){
		var defender2 = result;
	
	con.query("select * from (select * from player order by Rating desc)A where A.position = 'striker' and TeamID = '"+2+"' ORDER by Rating DESC limit 3;",function(err,result){
		var striker2 = result;
	
	con.query("select * from (select * from player order by Rating desc)A where A.position = 'midfielder' and TeamID = '"+2+"' ORDER by Rating DESC limit 3;",function(err,result){
		var midfielder2 = result;
	
	con.query("select * from (select * from player order by Rating desc)A where A.position = 'goalkeeper' and TeamID = '"+2+"' ORDER by Rating DESC limit 1;",function(err,result){
		var goalkeeper2 = result;

		res.render('fixtures',{
			title : "Fixtures",
			striker1 : striker1,
			defender1 : defender1,
			midfielder1 : midfielder1,
			goalkeeper1 : goalkeeper1,
			team1 : team1,
			striker2 : striker2,
			defender2 : defender2,
			midfielder2 : midfielder2,
			goalkeeper2 : goalkeeper2,
			team2 : team2

		});
 		});
		});
		});
		});
	});

});
});
});
});
});
	});


router.get('/team/playing/:id',function(req,res,next){

	con.query("SELECT * FROM team WHERE TeamID = '"+req.params.id+"'",function(err,result){
		var team = result;

	con.query("select * from (select * from player order by Rating desc)A where A.position = 'defender' and TeamID = '"+req.params.id+"' ORDER by Rating DESC limit 4;",function(err,result){
		var defender = result;

	con.query("select * from (select * from player order by Rating desc)A where A.position = 'striker' and TeamID = '"+req.params.id+"' ORDER by Rating DESC limit 3;",function(err,result){
		var striker = result;

	con.query("select * from (select * from player order by Rating desc)A where A.position = 'midfielder' and TeamID = '"+req.params.id+"' ORDER by Rating DESC limit 3;",function(err,result){
		var midfielder = result;

	con.query("select * from (select * from player order by Rating desc)A where A.position = 'goalkeeper' and TeamID = '"+req.params.id+"' ORDER by Rating DESC limit 1;",function(err,result){
		var goalkeeper = result;

		res.render('playing11',{
			title : "Playing XI",
			striker : striker,
			defender : defender,
			midfielder : midfielder,
			goalkeeper : goalkeeper,
			team : team
		
		});

 		});
		});
		});
		});
	});
});


router.get('/player/:id',function(req,res,next){

  var results5;
  if(req.user)
   {
 		 con.query("SELECT * FROM player WHERE Player_ID = '"+req.params.id+"' and TeamID IS NULL" ,function(err,result){
		  results5 = result;
		  console.log(results5.length);

  	if(results5.length > 0)
  	{
		var userID = req.user.user_id;

		con.query("SELECT * FROM player WHERE Player_ID = '"+req.params.id+"'",function(err,result){
			var results2 = result;

		con.query("SELECT * FROM skill WHERE Player_ID = '"+req.params.id+"'",function(err,result){
			var results3 = result;

		con.query("SELECT * FROM stats WHERE Player_ID = '"+req.params.id+"'",function(err,result){
			var results1 = result;

		con.query("SELECT * FROM team WHERE TeamID = (?)",[results2[0].TeamID],function(err,result){
			var userx = 0;

		res.render('player',{
			title : "Player",
			items : results2,
			stat : results1,
			skill : results3,
			team : results5,
			teamname : result,
			user : userx
		});
	  });
	});
   });
  });
  }else{
	var userID = req.user.user_id;

	con.query("SELECT * FROM player WHERE Player_ID = '"+req.params.id+"'",function(err,result){
		var results2 = result;

	con.query("SELECT * FROM skill WHERE Player_ID = '"+req.params.id+"'",function(err,result){
		var results3 = result;

	con.query("SELECT * FROM stats WHERE Player_ID = '"+req.params.id+"'",function(err,result){
		var results1 = result;

	con.query("SELECT * FROM team WHERE TeamID = (?)",[results2[0].TeamID],function(err,result){
		var userx;
		if(req.user.user_id === result[0].Mid)
			userx = 1;

		res.render('player',{
			title : "Player",
			items : results2,
			stat : results1,
			skill : results3,
			team : results5,
			teamname : result,
			user : userx
		});
	  });
	});
   });
  });
  }
});
}else{

	con.query("SELECT * FROM player WHERE Player_ID = '"+req.params.id+"' and TeamID IS NULL" ,function(err,result){
		  results5 = result;

  	con.query("SELECT * FROM player WHERE Player_ID = '"+req.params.id+"'",function(err,result){
		var results2 = result;

	con.query("SELECT * FROM skill WHERE Player_ID = '"+req.params.id+"'",function(err,result){
		var results3 = result;

	con.query("SELECT * FROM stats WHERE Player_ID = '"+req.params.id+"'",function(err,result){
		var results1 = result;

	con.query("SELECT * FROM team WHERE TeamID = (?)",[results2[0].TeamID],function(err,result){

		res.render('player',{
			title : "Player",
			items : results2,
			stat : results1,
			skill : results3,
			team : results5,
			teamname : result
		});
	  });
	});
   });
  });
  });
  }


});


router.get('/player', function(req, res, next) {
  con.query("select * from player order by Rating DESC", function(err,result){
		res.render('players',{
		title : "Players",
		items : result
	});
  });
});


router.get('/buyplayer/:id',authenticationMiddleware(), function(req, res, next) {
	if(req.user){
		con.query("select * from team where Mid = (?)",[req.user.user_id],function(err,result){
			var temp = result[0].TeamID;

		con.query("UPDATE player SET TeamID = ? WHERE player_ID = '"+req.params.id+"'",[temp],function(err,results){
  			if(err)
  			{
  				res.redirect('/player/' +req.params.id);
  			}
  		});

  			res.redirect('/team/'+temp)

		});
	}else{
		res.render('login', { title: 'Login' });
	}
});


router.get('/sellplayer/:id',authenticationMiddleware(), function(req, res, next) {
	if(req.user){
		con.query("select * from team where Mid = (?)",[req.user.user_id],function(err,result){
			var temp = result[0].TeamID;

		con.query("UPDATE player SET TeamID = NULL WHERE player_ID = '"+req.params.id+"'",function(err,results){
  			if(err)
  			{
  				res.redirect('/player/' +req.params.id);
  			}
  		});

  			res.redirect('/team/'+temp)

		});
	}else{
		res.render('login', { title: 'Login' });
	}
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


router.get('/transfer', function(req, res, next) {
  con.query("select * from player WHERE Position = ? order by player_ID ASC",['striker'], function(err,result){
		res.render('transfer',{
		title : "Striker",
		items : result
	});
  });
});


router.get('/midfielder', function(req, res, next) {
con.query("select * from player WHERE Position = ? order by player_ID ASC",['midfielder'], function(err,result){
		res.render('midfielder',{
		title : "Mid Fielders",
		items : result
	});
  });
});

router.get('/defender', function(req, res, next) {
  con.query("select * from player WHERE Position = ? order by player_ID ASC",['defender'], function(err,result){
		res.render('defender',{
		title : "Defenders",
		items : result
	});
  });
});

router.get('/goalkeeper', function(req, res, next) {
  con.query("select * from player WHERE Position = ? order by player_ID ASC",['goalkeeper'], function(err,result){
		res.render('goalkeeper',{
		title : "Goal Keepers",
		items : result
	});
  });
});


router.get('/createteam',authenticationMiddleware(), function(req, res, next) {
  res.render('createteam', {
  	title: 'Create a new team',
  	errors : ''
  });
});

router.get('/new', function(req, res, next) {
  res.render('new', { title: 'Create a new team' });
});


router.post('/createteam', function(req, res, next) {

	req.checkBody('createteam','Team Name field cannot be empty').notEmpty();
	req.checkBody('createteam','Team Name must be 5-100 characters long').len(5,100)

	const errors = req.validationErrors();

	if(errors){
		console.log(`errors: ${JSON.stringify(errors)}`);

		res.render('createteam', {
			title: 'Team Error',
			errors : errors
			    });
			}
	else{
		const teamname = req.body.createteam;

		con.query('INSERT INTO team(TName,Mid)VALUES(?,?)', [teamname, req.user.user_id],
		function(error,results,fields){
			if(error) throw error;
				res.redirect('/profile');
		});

   }
});

router.get('/search', function(req, res, next) {
  res.render('search', {
   title: 'search',
   items : '',
   errors : ''
    });
});

router.post('/search', function(req, res, next) {

	req.checkBody('search','Player Name field cannot be empty').notEmpty();

	const errors = req.validationErrors();

	if(errors){
		console.log(`errors: ${JSON.stringify(errors)}`);

		res.render('search', {
			title: 'Search error',
			items :'',
			errors : errors
			    });
			}
	else{
		var searchname = req.body.search;
		console.log(searchname);
		con.query("select * from player WHERE firstname LIKE ? OR lastname LIKE ?",['%'+req.body.search+'%','%'+req.body.search+'%'], function(err,result){
			if(err) throw err;

			res.render('search',{
			title : "Players",
			items : result,
			errors : ''
	    	});
		});
   }
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
