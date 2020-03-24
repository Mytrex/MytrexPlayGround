const request = require('request');
const urlHost = 'https://platform.devtest.ringcentral.com';
module.exports = {
    ringOut: function(req, res, next){

        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "bearer "+req.access_token
        }
        let body = {
            "from": {"phoneNumber": "14703940075"},
            "to": {"phoneNumber": "18016692880"},
            "playPrompt": true,
            "country": { "id" : "1" },
            "callerId": {"phoneNumber": "14703940075"}
        }
        let uri = urlHost + '/restapi/v1.0/account/~/extension/~/ring-out';
        return request.post({
                url: uri,
                headers: headers,
                body: body,
                json: true
            },
            function (error, response, body) {
                if (!error && response && response.statusCode === 200) {
                    res.status(200).json(body)
                } else {
                     res.status(400).json(body)
                }

            }
        )
    }
};