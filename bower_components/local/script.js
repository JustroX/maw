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
		templateUrl: "pages/dashboard.ejs"
	})
} );

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
		$scope.pages[$scope.location[0]].onload();
	}

	$scope.location = [];
	$scope.pages = {};
	$scope.user = {};

	//open token
	if(!cookie.get('breeding-api-auth-token')) 
			$location.path('/'); 
	var payload= JSON.parse(atob(token)).payload;
	$scope.user.username = payload.username;
	$scope.user.priv = payload.priv;


});