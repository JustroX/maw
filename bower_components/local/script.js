var app = angular.module("site",["ngRoute"]);

app.config( ($routeProvider) => {
	$routeProvider
	.when("/",{
		templateUrl: "pages/preloader",
	})
	.when("/login",{
		templateUrl: "pages/auth"
	})
	.when("/dashboard",{
		templateUrl: "pages/dashboard.handlebars"
	})
} );
app.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
});


app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});
//cookie functions
var cookie = 
{
	set: (cname, cvalue, exdays=1) =>
	{
	    var d = new Date();
	    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	    var expires = "expires="+d.toUTCString();
	    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	},

	get: (cname) =>
	{
	    var name = cname + "=";
	    var ca = document.cookie.split(';');
	    for(var i = 0; i < ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0) == ' ') {
	            c = c.substring(1);
	        }
	        if (c.indexOf(name) == 0) {
	            return c.substring(name.length, c.length);
	        }
	    }
	    return "";
	}
}

var token;
token = cookie.get('breeding-api-auth-token');

app.controller("preloaderController",($scope,$http,$location) => {
	if(token)
		$location.path('/dashboard');
	else
		$location.path('/login');
});

app.controller("authController",($scope,$http,$location) => {
	$scope.form= {username:"",password:""};
	
	$scope.auth = { failed: false , load : false};

	$scope.form.submit = () =>
	{
		$scope.auth.failed = false;
		$scope.auth.load = true;
		$http.post('/breeding/auth',{form: $scope.form}).then((res)=>{
			$scope.auth.load = false;
			res = res.data;
			if(res.err)
			{
				$scope.auth.failed = true;
				$scope.form.password ="";
			}
			else
			{
				token = res.token;
				cookie.set('breeding-api-auth-token',token);
				$location.path('/dashboard');
			}
		})
	}
});


app.controller("dashboardController",($scope,$http,$location) => {

	function notify(mes,type)
	{
		$.notify({
			// options
			message: mes 
		},{
			// settings
			type: type
		});
	}
	//UTIL FUNCTIONS
	$scope.logout = ()=>
	{
		cookie.set('breeding-api-auth-token',{},-1);
		$location.path('/login');
	}

	$scope.is_here = (path) =>
	{
		var same = false;
		path = path.split('/');
		for(let i in path)
			same |= (path[i] == $scope.location[i]);	
		return same;
	}
	$scope.goto = (path) =>
	{
		$scope.location = path.split('/');
		$scope.pages[$scope.location.join('/')].run();
	}
	$scope.addPage = (path,fn) =>
	{
		if(!$scope.pages[path])
			$scope.pages[path] = {};
		$scope.pages[path].run = ()=>{
			fn($scope.pages[path]);
		};
	}

	$scope.location = ["render"];
	$scope.pages = {};
	$scope.user = {};


	$scope.addPage('users', (page) =>{

		page.load_users = ()=>
		{
			$http.post('/breeding/users',{token:token}).then((res)=>{
				res = res.data;
				if(res.err)
					console.log(res.err);
				else
					page.list = res;
			});
			
		}

		page.mode = "add";
		page.modal = { form: { priv:[] } };
		page.modal.username_available = true;
		page.load_users();
		page.togglePriv = (priv)=>
		{
			if(page.modal.form.priv.includes(priv))
				page.modal.form.priv.splice(page.modal.form.priv.indexOf(priv),1);
			else
				page.modal.form.priv.push(priv);
		}
		page.modal.is_available = ()=>
		{
			$http.post("/breeding/user/exists",{token:token, username: page.modal.form.username}).then((res)=>{
				res = res.data;
				page.modal.username_available = res;
			});
		}
		page.modal.is_same_password = ()=>
		{
			return page.modal.form.password == page.modal.form.rpassword;
		}
		page.modal.submit = ()=>
		{
			if(page.mode == "add")
				page.modal.submit_add();
			else
				page.modal.submit_edit();
		}

		page.modal.submit_edit = ()=>
		{
			if(!page.modal.is_same_password() && page.modal.form.password !="")
			{
				notify("There is an error in your input","danger");
				return
			}
			$http.post('/breeding/user/edit',{token:token,form:page.modal.form}).then((res)=>{
				res = res.data;
				if(res.err)
					notify(res.err,"danger");
				else
				{
					notify(res.mes,"success");
					page.load_users();
				}
				$("#user-form").modal('toggle');
			})
		}

		page.modal.submit_add = ()=>
		{
			if(!page.modal.is_same_password() || !page.modal.username_available)
			{
				notify("There is an error in your input","danger");
				return;
			}
			$http.post("/breeding/user/add",{token:token, form: page.modal.form}).then((res)=>{
				res = res.data;
				if(res.err)
					notify(res.err, "danger");
				else
				{
					notify(res.mes, "success");
					page.load_users();
				}
				$('#user-form').modal('toggle');
			});			
		}

		page.modal.submit_delete = ()=>
		{
			$http.post("/breeding/user/delete",{token:token , _id : page.modal.target._id}).then((res)=>{
				res = res.data;
				if(res.err)
					notify(res.err,"danger");
				else
				{
					notify(res.mes, "success");
					page.load_users();
				}
				$('#user-delete').modal('toggle');
			});
		}


		page.add = ()=>
		{
			page.mode = "add";
			page.modal.title = "Add new user";
			$('#user-form').modal('toggle');
		}
		page.edit = (obj)=>
		{
			// alert(JSON.stringify(obj));
			page.mode = "edit";
			page.modal.title = "Edit " + obj.username ;
			page.modal.target = obj;

			page.modal.form = obj;

			$("#user-form").modal('toggle');
		}
		page.delete = (obj) =>
		{
			page.mode = "delete";
			page.modal.title = obj.username; 
			page.modal.target = obj ;
			$("#user-delete").modal('toggle');
		}
	} );
	$scope.addPage('geneset', (page)=>{
		page.name = '';
		page.list = [];

		page.delete_confirm =  false;
		page.delete_selected = null;

		page.delete = (i)=>
		{
			page.delete_selected  = i._id;
			if(page.delete_confirm)
				$http.post('/breeding/api/geneset/delete',{token:token, id: i._id }).then((res)=>{
					res= res.data;
					if(res.err) return notify(res.err,"danger");
					notify(res.mes,"success");
					page.delete_confirm = false;
					page.fetch();
				});
			else
				page.delete_confirm = true;
		}

		page.submit = ()=>
		{
			$http.post('/breeding/api/geneset/add',{token:token,name: page.name}).then((res)=>{
				res = res.data;
				notify(res.mes,"success");
				if(res.err)
					return notify(res.err, "danger");
				page.name = "";
				page.fetch();
			});
		}
		page.fetch = ()=>
		{
			$http.post('/breeding/api/geneset',{token:token}).then((res)=>{
				res = res.data;
				console.log(res);
				if(res.err)
					return notify(res.err, "danger");
				page.list =res;
			});
		}
		page.view = (i)=>
		{
			page.geneset = i;
			page.allele.load();
		}

		page.assets = [];
		page.temp_asset = null;

		page.allele = {
			add : {
				label: "",
				mode: "allele",
			},
			edit : {},
			delete: 
			{

			},

			content : [],
			features: [	],
		};

		page.feature = {
			add : {
				feature : "",
				label : "",
				dominance: 0,
			},
			delete : {
				confirm : false
			},
			edit:
			{
				form:
				{
					_id: null,
					feature: "",
					label : "",
					dominance: 0,
					asset: null
				}
			}

		}

		page.feature.load_assets = ()=>
		{			
			$http.post('/breeding/api/asset',{token:token}).then((res)=>{
				res = res.data;
				page.assets = res;
			});
		}

		page.feature.load_assets();

		page.feature.select_asset = ()=>
		{
			page.feature.edit.form.asset = page.temp_asset._id;
		}

		page.feature.press_delete = (i) =>
		{
			if(page.feature.delete.confirm)
			{
				$http.post('/breeding/api/value/remove',{token:token, allele: page.allele.target._id , feature: page.allele.selected_feature._id}).then((res)=>{
					res = res.data;
					if(res.err) return notify(res.err, "danger");
					$("#feature-view").modal('toggle');
					page.feature.delete.confirm = false;
					page.allele.view(page.allele.target);
				});
			}
			else
				page.feature.delete.confirm = true;
		}

		page.feature.press_submit = ()=>
		{
			$http.post('/breeding/api/value/edit',{token:token,form:page.feature.edit.form}).then((res)=>
			{
				res = res.data;
				$("#feature-view").modal('toggle');
				if(res.err) return notify(res.err, "danger");
				notify(res.mes, "success");
			});
		}


		page.feature.cancel_delete = (i) =>
		{
			page.feature.delete.confirm = false;
		}


		page.allele.view = (i)=>
		{
			page.allele.target = i;
			$http.post("/breeding/api/allele/view",{token:token,id: i._id}).then((res)=>
			{
				res = res.data;
				if(res.err) return console.log(res.err);
				page.allele.features = res[0].values;
			});
		}
		page.allele.press_delete = ()=>
		{
			if(!page.allele.confirm_delete)
				page.allele.confirm_delete  =true;
			else
			{
				$http.post("/breeding/api/alelle/remove",{token:token, id: page.allele.target._id}).then((res)=>
				{
					res = res.data;
					if(res.err) return notify(res.err,"danger");
					notify(res.mes,"success");
					page.allele.confirm_delete = false;
					page.allele.target = null;
					page.allele.load();
				});
			}
		}
		page.allele.cancel_delete  =  ()=>
		{
			page.allele.confirm_delete  =false;
		}


		page.allele.load = ()=>
		{
			$http.post("/breeding/api/allele",{token:token, geneset: page.geneset}).then((res)=>{
				res = res.data;
				if(res.err) return console.log(res.err);
				page.allele.content = res.alleles;
			});
		}
		page.allele.add.submit = ()=>
		{
			$http.post("/breeding/api/allele/add",{token:token, geneset: page.geneset, mode: page.allele.add.mode , label : page.allele.add.label }).then((res)=>{
				res =res.data;
				page.allele.add.label ="";
				if(res.err)
					notify(res.err,"danger");
				else
				{
					notify(res.mes,"success");
					page.view(page.geneset);
				}
			});
		}

		page.allele.view_feature = (i)=>
		{
			page.allele.selected_feature = i;
			page.feature.edit.form = i;

			let f = null;
			for(let j of page.assets)
			{

				if(j._id == i.asset )
				{
					f = j;
				}
			}
			page.temp_asset = f; 

			$("#feature-view").modal('toggle');
		}


		page.feature.add.submit = ()=>
		{
			if(page.allele.target)
			$http.post('/breeding/api/value/add',{token:token, feature:  page.feature.add, target: page.allele.target }).then((res)=>{
				res = res.data;
				if(res.err) return notify(res.err,"danger");
				page.feature.add.feature = "";
				page.feature.add.label = "";
				page.feature.add.dominance = "";
				page.allele.view( page.allele.target );
			});
			else
			alert("Please select an alelle first.");
		}

		page.fetch();
	});

	let renderer = new MawRender();

	$scope.addPage('asset', (page)=>{
		page.selected = null;
		page.content = [];


		page.new_label = "";
		page.delete_confirm = false;

		let add_renderer = ()=>
		{
			if(document.getElementById('canvas_sprite'))
			{
				renderer.setCanvas(document.getElementById('canvas_sprite'));
				renderer.loop();
			}
			else
				setTimeout(()=>{add_renderer()},1000);
		}

		add_renderer();


		page.fetch = ()=>
		{
			$http.post('/breeding/api/asset',{token:token}).then((res)=>{
				res = res.data;
				page.content = res;
			});
		}

		page.add = ()=>
		{
			if(!page.new_label) return; 
			$http.post('/breeding/api/asset/add',{token:token, label: page.new_label}).then((res)=>{
				res = res.data;
				if(res.err) return notify(res.err, "danger");
				notify(res.mes,"success");
				page.fetch();
				page.new_label = "";
			});
		}

		page.view = (i)=>
		{
			$http.post('/breeding/api/asset/load',{token:token, id: i._id}).then((res)=>
			{
				res = res.data;
				if(res.err) return console.log(res.err);
				page.selected = res;
				page.render();
			});
		}

		page.render = ()=>
		{
			let img_raw = page.selected.image;
			let img = new Image();
			if(img_raw)
				img.src = img_raw;
			page.selected.image = img;

			if(renderer)
			renderer.setImage(page.selected);
			
		}

		let x = addlistener = ()=>
		{
			if(document.getElementById('file-sprite'))
			{
				document.getElementById('file-sprite').addEventListener('change', function(){
					var f = document.getElementById('file-sprite').files[0];
					let r = new FileReader();
					r.onloadend = (e)=>
					{
						let data  =e.target.result;
						page.selected.image.src  = data;
					}
					r.readAsDataURL(f);
				},false);
			}
			else
				setTimeout(()=>{addlistener();},1000);
		}


		addlistener();

		page.save = () =>
		{
			let form = 
			{
				label : page.selected.label,
				position: {x: page.selected.position.x ,y: page.selected.position.y},
				scale: {h: page.selected.scale.h ,v: page.selected.scale.v},
				depth : page.selected.depth,
				image : page.selected.image.src,
			};

			$http.post('/breeding/api/asset/update',{token:token, id: page.selected._id, form: form}).then((res)=>
			{
				res= res.data;
				if(res.err) return notify(res.err,"danger");
				notify(res.mes,"success");
				page.fetch();
			});
		}

		page.delete = ()=>
		{
			if(!page.delete_confirm)
			{
				page.delete_confirm = true;
				return;
			}

			$http.post('/breeding/api/asset/remove', {token: token, id: page.selected._id}).then((res)=>
			{
				res = res.data;
				page.selected = null;
				page.content.splice( page.content.indexOf(page.selected) , 1 );
				page.delete_confirm = false;
				if(res.err) return console.log(res.err);
				notify(res.mes, "success");
			});
		}


		page.fetch();
	});

	$scope.addPage('render',(page)=>
	{
		page.genesets = [];
		page.geneset = null;
		page.genes = "";

		$http.post('/breeding/api/geneset',{token:token}).then((res)=>
		{
			res = res.data;
			page.genesets = res;
		});

		page.render = ()=>
		{
			let local = new MawRenderLib(page.geneset._id);
			local.addCanvas( document.getElementById('render-api-canvas') );
			local.render(page.genes, $http ,token);

		}

	});


	//default page
	// setTimeout(()=>{$scope.goto('render');},1000);

	//open token
	if(!cookie.get('breeding-api-auth-token')) 
			$location.path('/'); 
	var payload= JSON.parse(atob(token)).payload;
	$scope.user.username = payload.username;
	$scope.user.priv = payload.priv;


});