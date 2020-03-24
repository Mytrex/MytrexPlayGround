const request = require('request')
var RingCentral = require('@ringcentral/sdk').SDK;

const RINGCENTRAL_CLIENT_ID = 'NpUS1WMFSx2uyLbzJNAp4A'
const RINGCENTRAL_CLIENT_SECRET = 'cGvMFZ0TSYaZB95-DXGLZgt0S_3i98T3aB25OGfBmqqQ'
const RINGCENTRAL_SERVER_URL = 'https://platform.devtest.ringcentral.com'
const RINGCENTRAL_REDIRECT_URL = 'http://localhost:5000/oauth2callback'
const authToken = "Basic " + (Buffer.from(`${RINGCENTRAL_CLIENT_ID}:${RINGCENTRAL_CLIENT_SECRET}`).toString('base64'));
const urlHost = 'https://platform.devtest.ringcentral.com'
var rcsdk = new RingCentral({
    server: RINGCENTRAL_SERVER_URL,
    clientId: RINGCENTRAL_CLIENT_ID,
    clientSecret: RINGCENTRAL_CLIENT_SECRET,
    redirectUri: RINGCENTRAL_REDIRECT_URL
});
let access_token = '';
let refresh_token = '';
module.exports = {
    authorize: function(req, res, next){
        let tryCount = 0;
        if(access_token){
            refresh_token();
        } else {
            getToken();
        }
        function getToken() {
            if(tryCount < 2){
                let headers = {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Charset": "UTF-8",
                    "Authorization": authToken
                }
                let form = {
                    "grant_type": "password",
                    "password": "SaveLives1",
                    "username": "14703940075",
                    "extension": "101"
                }
                return request.post({
                        url: urlHost + '/restapi/oauth/token',
                        headers: headers,
                        form: form,
                        json: true
                    },
                    function (error, response, body) {
                        if (!error && response && response.statusCode === 200 && body.access_token) {
                            access_token = body.access_token;
                            refresh_token = body.refresh_token;
                            req.access_token = access_token;
                            req.refresh_token = refresh_token;
                            next();
                        } else {
                            access_token = '';
                            refresh_token = '';
                            tryCount ++ 
                            getToken()
                        }

                    }
                )
            } else {
                res.status(400).send('Error Authorizing')
            }
        }
        function refresh_token (){
            console.log('refresh me please')
            res.status(200).send('need to refresh');
        }
        
    }
}
function callGetEndpoint(platform, endpoint, res) {
    platform.get(endpoint)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (json) {
            res.send(JSON.stringify(json))
        })
        .catch(function (e) {
            res.send("Error")
        })
}