var app = require('express')();
var session = require('express-session');
var RingCentral = require('@ringcentral/sdk').SDK;
var path = require('path')

app.use(session({ secret: 'somesecretstring', tokens: ''}));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const RINGCENTRAL_CLIENT_ID= '1Wt9HIagSrm3eVMvzo1niw'
const RINGCENTRAL_CLIENT_SECRET= 'cvJ8Z8JuTVOcjcMFFHRXjw-klwtpWYTDKvTX4RPSdBog'
const RINGCENTRAL_SERVER_URL= 'https://platform.devtest.ringcentral.com'
const RINGCENTRAL_REDIRECT_URL= 'http://localhost:5000/oauth2callback'

var rcsdk = new RingCentral({
  server: RINGCENTRAL_SERVER_URL,
  clientId: RINGCENTRAL_CLIENT_ID,
  clientSecret: RINGCENTRAL_CLIENT_SECRET,
  redirectUri: RINGCENTRAL_REDIRECT_URL
});

var server = require('http').createServer(app);
server.listen(5000);
console.log("listen to port 5000")

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