'use strict';

// Module Dependencies
const axios 			= require('axios');
var express     		= require('express');
var bodyParser  		= require('body-parser');
var errorhandler 		= require('errorhandler');
var http        		= require('http');
var path        		= require('path');
var request     		= require('request');
var urlencodedparser 	= bodyParser.urlencoded({extended:false});
var app 				= express();
var local       		= false;
var jsforce 			= require('jsforce');

// access Heroku variables
if ( !local ) {
	var salesForce = {
		loginUrl: 		process.env.authUrl,
		clientId: 		process.env.clientId,
		clientSecret: 	process.env.clientSecret,
		redirectUri: 	process.env.redirectUri
		grant_type: 	process.env.grant_type,
		username: 		process.env.username,
		password: 		process.env.password

	};
	console.dir(salesForce);
}

// Configure Express master
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({type: 'application/jwt'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Express in Development Mode
if ('development' == app.get('env')) {
	app.use(errorhandler());
}

const getOauth2Token = () => new Promise((resolve, reject) => {
	axios({
		method: 'post',
		url: salesForce.authUrl,
		data:{
			"grant_type": salesForce.grant_type,
			"client_id": salesForce.clientId,
			"client_secret": salesForce.clientSecret
		}
	})
	.then(function (oauthResponse) {
		console.dir('Bearer '.concat(oauthResponse.data.access_token));
		return resolve('Bearer '.concat(oauthResponse.data.access_token));
	})
	.catch(function (error) {
		console.dir("Error getting Oauth Token");
		return reject(error);
	});
});


//Fetch rows from update contacts data extension
app.get("/uploadfile", (req, res, next) => {

	var fileUploadPayload = [
		{
			"url": req.body.url,
		}
	]

	getOauth2Token().then((tokenResponse) => {
	   	axios({
			method: 'post',
			url: salesForceApiUrl,
			headers: {'Authorization': tokenResponse},
			data: fileUploadPayload
		})
		.then(function (response) {
			console.dir(response.data);
			//return resolve(response.data);
		})
		.catch(function (error) {
			console.dir(error);
			//return reject(error);
		});
	})	

});


// listening port
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});