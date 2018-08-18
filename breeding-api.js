/********************

Maw Breeding API
(c) 2018 Eternity Echo

Authors:
Justine Che T. Romero

*******************/

var app; //express app

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

