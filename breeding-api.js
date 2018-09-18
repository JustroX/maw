/********************

Maw Breeding API
(c) 2018 Eternity Echo

Authors:
Justine Che T. Romero

*******************/

var app; //express app
var pth = require('path'); //path module
var jwt = require('./jwt-ee.js');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';
var db;
var ObjectId = require('mongodb').ObjectID;

var SHA256 = require('crypto-js/SHA256');

var settings =
{
	geneset : 0,
	secret: "5526B47F0B2B5B87AE1EB88FA1CAC63F84800F0019B56F6F80B68C0850B63CDC"
}

MongoClient.connect(url , (err,dbo) =>{
	if(err) throw err;
	db = dbo.db('local');
	console.log("Succesfully connected to Breeding API database. ");	
});

function validate(priv, req, res, f)
{
	var payload = jwt.validate( req.body.token );
	if(payload)
	{
		db.collection('user').findOne({username: payload.username},(err,result)=>{
			if(err) throw err;
			if(result)
			{
				if(result.priv.includes(priv))
					f(result._id);
				else
					res.send({err:'PERMISSION_DENIED'});
			}
			else
				res.send({err:'USER_NOT_FOUND'});
		});
	}
	else
		res.send({err:"TOKEN_INTEGRITY_FAILED"});
}

exports.init = (app)=>
{
	// app.set('view engine','ejs');

	//gui
	app.get('/breeding/',(req,res)=>{
		res.render('breeding-api/index',{layout:false});
	});


	//resources
	app.get('/breeding/res/*',(req,res)=>{		
		var path = req.originalUrl.substr(13,req.originalUrl.length-13);
		res.sendFile(pth.join(__dirname,"/bower_components/",path));
	});

	app.get('/breeding/pages/*',(req,res)=>{		
		var path = req.originalUrl.substr(15,req.originalUrl.length-15);
		console.log(path);
		res.render('breeding-api/'+path,{layout:false});
	});


	//auth
	app.post('/breeding/auth',(req,res)=>{
		// console.log("been here");
		let username = req.body.form.username;
		let password = req.body.form.password;

		password = SHA256(password + settings.secret).toString();

		db.collection('user').findOne({username:username,password:password},(err,result)=>{
			if(err) throw err;
			console.log(password);
			if(result)
			{
				//generate token
				var  token = jwt.new({username:username, priv: result.priv });
				res.send({ token : token });
			}
			else
				res.send({err:"AUTH_FAILED"});
		});
	});

	app.post('/breeding/users',(req,res)=>{
		validate("admin",req,res,(_id)=>{
			db.collection('user').find({},{projection:{	_id: 1, username: 1, name: 1, priv: 1, email: 1 }}).toArray((err,result)=>{
				if(err) throw err;
				res.send(result);
			})
		});
	});
	app.post('/breeding/user/exists',(req,res)=>{
		validate("admin",req,res,(id)=>{
			let username = req.body.username;
			db.collection('user').find({username:username}).toArray((err,result)=>{
				if(err) throw err;
				res.send( (result[0] ? false : true));
			});
		});
	});

	app.post('/breeding/user/add',(req,res)=>{
		validate("admin",req,res,(id)=>{
			let form = req.body.form;
			//check if email exists
			form.password  = SHA256(form.password + settings.secret).toString();
			db.collection('user').find({email:form.email}).toArray((err,result)=>{
				if(err) throw err;
				console.log(result);
				if(result[0])
				{
					res.send({err:"Email address is already registered."});
				}
				else
				{
					db.collection('user').insertOne(form,(err,result_1)=>{
						if(err) throw err;
						res.send({mes: "New user has been added."});
					});
				}
			});
		});
	});

	app.post('/breeding/user/edit',(req,res)=>{
		validate("admin",req,res,(id)=>{
			let form = req.body.form;
			let _id = form._id;
			if(form.password) form.password  = SHA256(form.password + settings.secret).toString();
			delete form._id;
			// console.log(JSON.stringify(form));
			db.collection('user').updateOne({_id: ObjectId(_id) },{ $set: form},
				(err,result)=>
				{
					if(err) throw err;
					res.send({mes:"User info has been updated."});
				});
		});
	});

	app.post('/breeding/user/delete',(req,res)=>{
		validate("admin",req,res,(id)=>{
			let obj = req.body._id;
			if( id == obj )
			{
				res.send({err: "You can not delete yourself."});
				return;
			}
			db.collection('user').deleteOne({_id: ObjectId(obj)} , (err,result)=>{
				if(err) throw err;
				res.send({mes: "User has been deleted."});
			})
		});
	});

	app.post('/breeding/api/geneset',(req,res)=>{
		validate("maw",req,res,(id)=>{

			db.collection('geneset').find({}).toArray((err,result)=>{
				if(err) throw err;
				console.log(result);
				res.send(result);
			});
		});
	});
	app.post('/breeding/api/geneset/add',(req,res)=>{
		validate("maw",req,res,(id)=>{
			let d = req.body.name;
			db.collection('geneset').insertOne(
				{   
					label : d,
					alelles : [],
				}
				, (err,result)=>{
				if(err) throw err;
				res.send({mes: "Geneset added."});
			});
		});
	});
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

