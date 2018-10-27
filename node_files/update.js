var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");});


setInterval(function(){
    // this code will only run when time has ellapsed

var i =1;
while(i<100)
{
   con.query("update skill set Reflexes = ?,Dribbling = ?,Crossing=?,Ball_control = ?,Stamina = ?,Work_rate = ?,Short_passing = ?,Long_shot = ?,Balance = ?,Diving = ?,Vision = ?,Aggression = ?,Interception = ?,Long_throw = ?,Marking = ?,Finishing = ?,standing_tackle = ? WHERE Player_ID = ?",
    [Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,Math.floor(Math.random() * (100 - 40)) + 40,i], function (err, result) {
    if (err) throw err;
  });
   i=i+1;
}

 console.log("Table skill updated");

}, 2* 60 * 1000);

