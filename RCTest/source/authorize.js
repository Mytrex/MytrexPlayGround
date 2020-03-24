const request = require('request');
const moment = require('moment');
var RingCentral = require('@ringcentral/sdk').SDK;

const RINGCENTRAL_CLIENT_ID = process.env.RINGCENTRAL_CLIENT_ID;
const RINGCENTRAL_CLIENT_SECRET = process.env.RINGCENTRAL_CLIENT_SECRET;
const RINGCENTRAL_SERVER_URL = process.env.RINGCENTRAL_SERVER_URL;
const RINGCENTRAL_REDIRECT_URL = process.env.RINGCENTRAL_REDIRECT_URL;
const AUTH_TOKEN = "Basic " + (Buffer.from(`${RINGCENTRAL_CLIENT_ID}:${RINGCENTRAL_CLIENT_SECRET}`).toString('base64'));
var rcsdk = new RingCentral({
    server: RINGCENTRAL_SERVER_URL,
    clientId: RINGCENTRAL_CLIENT_ID,
    clientSecret: RINGCENTRAL_CLIENT_SECRET,
    redirectUri: RINGCENTRAL_REDIRECT_URL
});
let access_token = '';
let refresh_token = '';
let accessExpires = '';
let refreshExpires = '';
module.exports = {
    authorize: function(req, res, next){
        let tryCount = 0;
        if(access_token && refresh_token && accessExpires && refreshExpires){
            if (accessExpires < moment().subtract(30, 'seconds') && refreshToken > moment().subtract(30, 'seconds')) {
                //if the accessToken expires but we still have a refresh token that's good
                refreshToken();
            } else if (refreshToken < moment().subtract(30, 'seconds')) {
                //if our refresh token has expired, we'll get a new one. 
                getToken()
            } else {
                //other wise we are good to go still! 
                req.access_token = access_token;
                req.refresh_token = refresh_token;
                next();
            }
        } else {
            getToken();
        }
        function getToken() {
            if(tryCount < 2){
                let headers = {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Charset": "UTF-8",
                    "Authorization": AUTH_TOKEN
                }
                let form = {
                    "grant_type": "password",
                    "password": process.env.RINGCENTRAL_PASSWORD,
                    "username": process.env.RINGCENTRAL_USERNAME,
                    "extension": process.env.RINGCENTRAL_EXTENSION
                }
                return request.post({
                        url: RINGCENTRAL_SERVER_URL + '/restapi/oauth/token',
                        headers: headers,
                        form: form,
                        json: true
                    },
                    function (error, response, body) {
                        if (!error && response && response.statusCode === 200 && body.access_token) {
                            access_token = body.access_token;
                            refresh_token = body.refresh_token;
                            accessExpires = moment().add(body.expires_in, "seconds");
                            refreshExpires = moment().add(body.refresh_token_expires_in, "seconds");
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
        function refreshToken (){
            let headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Charset": "UTF-8",
                "Authorization": AUTH_TOKEN
            }
            let form = {
                "grant_type": "refresh_token",
                "refresh_token": refresh_token
            }
            return request.post({
                    url: RINGCENTRAL_SERVER_URL + '/restapi/oauth/token',
                    headers: headers,
                    form: form,
                    json: true
                },
                function (error, response, body) {
                    if (!error && response && response.statusCode === 200 && body.access_token) {
                        access_token = body.access_token;
                        refresh_token = body.refresh_token;
                        accessExpires = moment().add(body.expires_in, "seconds");
                        refreshExpires = moment().add(body.refresh_token_expires_in, "seconds");
                        req.access_token = access_token;
                        req.refresh_token = refresh_token;
                        next();
                    } else {
                        access_token = '';
                        refresh_token = '';
                        tryCount++
                        getToken()
                    }

                }
            )
        }
        
    }
}