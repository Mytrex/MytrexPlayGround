require('dotenv').config();
const SDK = require('@ringcentral/sdk').SDK

RECIPIENT = '<ENTER PHONE NUMBER>'

const RINGCENTRAL_CLIENT_ID= process.env.RINGCENTRAL_CLIENTID;
const RINGCENTRAL_CLIENT_SECRET= process.env.RINGCENTRAL_CLIENT_SECRET;
const RINGCENTRAL_SERVER = process.env.RINGCENTRAL_SERVER_URL;

const RINGCENTRAL_USERNAME = process.env.RINGCENTRAL_USERNAME;
const RINGCENTRAL_PASSWORD = process.env.RINGCENTRAL_PASSWORD;
const RINGCENTRAL_EXTENSION = process.env.RINGCENTRAL_EXTENSION;

var rcsdk = new SDK({
    server: RINGCENTRAL_SERVER,
    clientId: RINGCENTRAL_CLIENTID,
    clientSecret: RINGCENTRAL_CLIENTSECRET
});
var platform = rcsdk.platform();
platform.login({
  username: RINGCENTRAL_USERNAME,
  password: RINGCENTRAL_PASSWORD,
  extension: RINGCENTRAL_EXTENSION
})
.then(function(resp) {
    call_ringout()
});

function call_ringout() {
    platform.post('/restapi/v1.0/account/~/extension/~/ring-out', {
      'from' : { 'phoneNumber': RINGCENTRAL_USERNAME },
      'to'   : {'phoneNumber': RECIPIENT},
      'playPrompt' : false
    })
    .then(function(resp) {
      return resp.json()
    })
    .then(function(json){
        console.log("Call placed. Call status: " + json.status.callStatus)
    })
}