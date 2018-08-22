/********************

Maw Breeding API
(c) 2018 Eternity Echo

Authors:
Justine Che T. Romero

*******************/

var app; //express app
var pth = require('path'); //path module
var jwt = require('./jwt-ee.js');

var settings =
{
	geneset : 0,
}


exports.init = (app)=>
{
	//gui
	app.get('/breeding/',(req,res)=>{
		res.render('breeding-api/index');
	});


	//resources
	app.get('/breeding/res/*',(req,res)=>{		
		var path = req.originalUrl.substr(13,req.originalUrl.length-13);
		res.sendFile(pth.join(__dirname,"/bower_components/",path));
	});

	app.get('/breeding/pages/*',(req,res)=>{		
		var path = req.originalUrl.substr(15,req.originalUrl.length-15);
		console.log(path);
		res.render('breeding-api/'+path);
	});


	//auth
	app.post('/breeding/auth',(req,res)=>{

		let usename = req.body.form.username;
		let password = req.body.form.password;

		password = SHA256(password).toString();

		//check database if usename and password exists
	});

	app.post('/breeding/api/geneset/add',(req,res)=>{});
	app.post('/breeding/api/geneset/edit',(req,res)=>{});
	app.post('/breeding/api/geneset/delete',(req,res)=>{});

	app.post('/breeding/api/alelle/add',(req,res)=>{});
	app.post('/breeding/api/alelle/edit',(req,res)=>{});
	app.post('/breeding/api/alelle/delete',(req,res)=>{});
	
	app.post('/breeding/api/value/add',(req,res)=>{});
	app.post('/breeding/api/value/edit',(req,res)=>{});
	app.post('/breeding/api/value/delete',(req,res)=>{});
	
	app.post('/breeding/api/asset/add',(req,res)=>{});
	app.post('/breeding/api/asset/edit',(req,res)=>{});
	app.post('/breeding/api/asset/delete',(req,res)=>{});
}

