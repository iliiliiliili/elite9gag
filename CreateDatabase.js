'use strict';

const mysql = require('mysql');
const fs = require('fs');

const [host, user, password] = fs.readFileSync('DataBase.pswd', 'utf8').split ('\n').map (x => x.trim ());

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE mydb", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});

console.log ([host, user, password]);