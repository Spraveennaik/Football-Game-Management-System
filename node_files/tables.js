var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  var sql = "create table manager(Mid int(6) AUTO_INCREMENT PRIMARY KEY, username varchar(20) UNIQUE, firstname varchar(20),lastname varchar(20), Age int(3),country varchar(20), email varchar(20),image varchar(30),password BINARY(100))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table manager created");
  });

  var sql = "create table Team(TeamID int(6) PRIMARY KEY AUTO_INCREMENT, Mid int(6),FOREIGN KEY(Mid) REFERENCES manager(Mid) ON DELETE SET NULL, TName varchar(50))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table team created");
  });


  var sql = "create table Player(Player_ID int(5) PRIMARY KEY AUTO_INCREMENT, firstname varchar(15) NOT NULL,lastname varchar(15), Age int(3) NOT NULL, Country varchar(15) NOT NULL, Rating int(3) NOT NULL, Position varchar(10) NOT NULL,Height int(3) NOT NULL,Price int(8) NOT NULL, TeamID int(6) ,FOREIGN KEY(TeamID) REFERENCES Team(TeamID) ON DELETE SET NULL);";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table Player created");
  });

 var sql = "create table stats(Appearances int(3) NOT NULL, Goals int(3) NOT NULL,Key_passes int(3) NOT NULL,Assists int(3) NOT NULL,saves int(3),Clearances int(3),Clean_sheets int(3),Player_ID int(5),FOREIGN KEY(Player_ID) REFERENCES Player(Player_ID) ON DELETE CASCADE);";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table stats created");
  });

var sql = "create table skill(Reflexes int(3) NOT NULL, Dribbling int(3) NOT NULL, Crossing int(3) NOT NULL,Ball_control int(3) NOT NULL, Stamina int(3) NOT NULL,Work_rate int(3) NOT NULL,Short_passing int(3) NOT NULL,Long_shot int(3) NOT NULL,Balance int(3) NOT NULL,Diving int(3) NOT NULL,Vision int(3) NOT NULL,Aggression int(3) NOT NULL, Interception int(3) NOT NULL,Long_throw int(3) NOT NULL, Marking int(3) NOT NULL,Finishing int(3) NOT NULL,standing_tackle int(3) NOT NULL,Player_ID int(5),FOREIGN KEY(Player_ID) REFERENCES Player(player_ID) ON DELETE CASCADE);";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table skills created");
  });  


  
/* 
  var sql = "CREATE TABLE customers3 (name VARCHAR(255), address VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table customers3 created");
  });
*/
});

