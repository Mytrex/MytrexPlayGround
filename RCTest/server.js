//NPM packages
require('dotenv').config();
const express = require('express'),
bodyParser = require('body-parser'),
// session = require('express-session'), //Not sure if we can take advantage of this or not.
path = require('path');


//Local Requires;
const authorize = require('./source/authorize.js'), 
ringOut = require('./source/ringout.js');


var app = express();

var jsonParser = bodyParser.json({
  limit: 1024 * 1024 * 20,
  type: 'application/json'
});

app.use(jsonParser);

app.get('/ringOut', authorize.authorize, ringOut.ringOut);

var server = app.listen(5000, function () {
  console.log("listening on port 5000")
});

module.exports = app;