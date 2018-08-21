var SHA256 = require('crypto-js/SHA256');


var generate_head = (req) =>
{
	return { };
}


var generate_token = (payload,salt = "")=>
{

	var a = 
	{
		head :generate_head(),
		payload : payload
	};

	a.hash = SHA256( JSON.stringify(a.head) + JSON.stringify(a.payload) + salt ).toString();
	return atob(a);
} 