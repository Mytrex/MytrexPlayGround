//NPM packages
require('dotenv').config();
const express = require('express'),
bodyParser = require('body-parser'),
session = require('express-session'),
path = require('path');


//Local Requires;
const authorize = require('./source/authorize.js'), 
ringout = require('./source/ringout.js');


var app = express();

var jsonParser = bodyParser.json({
  limit: 1024 * 1024 * 20,
  type: 'application/json'
});

app.use(jsonParser);
app.use(session({ secret: 'somesecretstring', tokens: ''}));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const RINGCENTRAL_CLIENT_ID= process.env.RINGCENTRAL_CLIENT_ID;
const RINGCENTRAL_CLIENT_SECRET= process.env.RINGCENTRAL_CLIENT_SECRET;
const RINGCENTRAL_SERVER_URL= process.env.RINGCENTRAL_SERVER_URL;
const RINGCENTRAL_REDIRECT_URL= process.env.RINGCENTRAL_REDIRECT_URL;

var RingCentral = require('@ringcentral/sdk').SDK;
var rcsdk = new RingCentral({
  server: RINGCENTRAL_SERVER_URL,
  clientId: RINGCENTRAL_CLIENT_ID,
  clientSecret: RINGCENTRAL_CLIENT_SECRET,
  redirectUri: RINGCENTRAL_REDIRECT_URL
});

//client secret: "cGvMFZ0TSYaZB95-DXGLZgt0S_3i98T3aB25OGfBmqqQ"
//client ID: "NpUS1WMFSx2uyLbzJNAp4A"
//PhoneNumber: 14703940075
app.get('/ringout', authorize.authorize, ringout.ringOut);
app.get('/index', function (req, res) {
  res.redirect("/")
})
app.get('/', function (req, res) {
    var platform = rcsdk.platform()
    if (req.session.tokens != undefined){
        var tokensObj = req.session.tokens
        platform.auth().setData(tokensObj);
        platform.loggedIn().then(function(isLoggedIn) {
          if (isLoggedIn) {
            return res.render('test')
          }
          res.render('index', {
              authorize_uri: platform.loginUrl({
                brandId: ''
              })
          });
        })
        return;
    }
    res.render('index', {
        authorize_uri: platform.loginUrl({
          brandId: ''
        })
    });
})

app.get('/logout', function(req, res) {
  if (req.session.tokens != undefined){
      var tokensObj = req.session.tokens
      var platform = rcsdk.platform()
      platform.auth().setData(tokensObj)
      platform.loggedIn().then(function(isLoggedIn) {
        if (isLoggedIn) {
          platform.logout()
            .then(function(resp){
                console.log("logged out")
            })
            .catch(function(e){
                console.log(e)
            });
        }
        req.session.tokens = null
        res.redirect("/")
      });
      return
  }
  res.redirect("/")
})

app.get('/oauth2callback', function(req, res) {
  if (req.query.code) {
      var platform = rcsdk.platform()
      platform.login({
          code: req.query.code,
      })
      .then(function(response) {
        return response.json()
      })
      .then(function (token) {
          req.session.tokens = token
          res.redirect("/test")
      })
      .catch(function (e) {
          res.send('Login error ' + e)
      });
  }else {
      res.send('No Auth code');
  }
});

app.get('/test', function(req, res) {
  if (req.session.tokens != undefined){
      var tokensObj = req.session.tokens
      var platform = rcsdk.platform()
      platform.auth().setData(tokensObj)
      platform.loggedIn().then(function(isLoggedIn) {
        if (isLoggedIn) {
          if (req.query.api == "extension"){
            var endpoint = "/restapi/v1.0/account/~/extension"
            return callGetEndpoint(platform, endpoint, res)
          } else if (req.query.api == "extension-call-log"){
            var endpoint = "/restapi/v1.0/account/~/extension/~/call-log"
            return callGetEndpoint(platform, endpoint, res)
          } if (req.query.api == "account-call-log"){
            var endpoint = "/restapi/v1.0/account/~/call-log"
            return callGetEndpoint(platform, endpoint, res)
          }
        }
        res.redirect("/")
      })
      return;
  }
  res.redirect("/")
});

function callGetEndpoint(platform, endpoint, res){
    platform.get(endpoint)
    .then(function(resp){
      return resp.json()
    })
    .then(function(json) {
      res.send(JSON.stringify(json))
    })
    .catch(function(e){
        res.send("Error")
    })
}

var server = app.listen(5000, function () {
  console.log("listening on port 5000")
});

module.exports = app;