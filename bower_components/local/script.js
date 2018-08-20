var app = angular.module("site",["ngRoute"]);

app.config( ($routeProvider) => {
	$routeProvider
	.when("/",{
		templateUrl: "pages/auth"
	})
	.when("/login",{
		templateUrl: "pages/auth"
	})
	.when("/dashboard",{
		templateUrl: "/pages/dashboard.ejs"
	})
} );


app.controller("authController",($scope,$http,$location) => {
	$scope.form= {username:"",password:""};
	$scope.form.submit = () =>
	{
		;
	}
});
