const SDK = require('@ringcentral/sdk').SDK

RECIPIENT = '<ENTER PHONE NUMBER>'

const RINGCENTRAL_CLIENT_ID= '1Wt9HIagSrm3eVMvzo1niw'
const RINGCENTRAL_CLIENT_SECRET= 'cvJ8Z8JuTVOcjcMFFHRXjw-klwtpWYTDKvTX4RPSdBog'
const RINGCENTRAL_SERVER = 'https://platform.devtest.ringcentral.com'

const RINGCENTRAL_USERNAME = '12536424612'
const RINGCENTRAL_PASSWORD = 'SaveLives1'
const RINGCENTRAL_EXTENSION = '101'

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