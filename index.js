/********************

Maw Server
(c) 2018 Eternity Echo

Authors:
Marino, Jude Wincel P.
Romero, Justine Che T.

*******************/


var app = require('express')();										//Express App 
var bodyParser  = require("body-parser");							
var urlencodedParser = bodyParser.urlencoded({extended: true});

var SHA256 = require('crypto-js/SHA256');							//imoprt cryptography module

var fs = require('fs');												//import file system module

app.use(urlencodedParser);
app.use(bodyParser.json());
app.set('view engine','ejs');


//breeding api
var breedingAPI = require('./breeding-api.js');						//Import Breeding api
breedingAPI.init(app);





app.get("/", (req,res)=> {
	console.log("Yeyeye");
	res.send('hello');
})







app.listen(3000 , (err)=> {											//open port
	console.log("App is @port 3000");
} );
