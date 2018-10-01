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

	$scope.location = ["geneset"];
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

		page.allele = {
			add : {
				label: "",
				mode: "allele",
			},
			edit : {},
			delete: {},

			content : [],
			features: [	],
		};

		page.feature = {
			add : {
				feature : "",
				label : "",
				dominance: 0,
			},

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

		page.feature.add.submit = ()=>
		{
			$http.post('/breeding/api/value/add',{token:token, feature:  page.feature.add, target: page.allele.target }).then((res)=>{
				res = res.data;
				if(res.err) return notify(res.err,"danger");
				page.feature.add.feature = "";
				page.feature.add.label = "";
				page.feature.add.dominance = "";
				page.allele.view( page.allele.target );
			});
		}

		page.fetch();
	});


	//default page
	setTimeout(()=>{$scope.goto('geneset');},1000);

	//open token
	if(!cookie.get('breeding-api-auth-token')) 
			$location.path('/'); 
	var payload= JSON.parse(atob(token)).payload;
	$scope.user.username = payload.username;
	$scope.user.priv = payload.priv;


});