const request = require('request');
const urlHost = 'https://platform.devtest.ringcentral.com';
module.exports = {
    ringOut: function(req, res, next){
        let tryCount = 0;
        let body = req.body;
        let toPhone = body.toPhone;
        let fromPhone = body.fromPhone;
        let callerId = body.callerId;
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "bearer "+req.access_token
        }
        let postBody = {
            "from": {"phoneNumber": fromPhone},
            "to": {"phoneNumber": toPhone},
            "playPrompt": (!body.playPrompt)? body.playPrompt : false,
            "country": { "id" : "1" },
            "callerId": {"phoneNumber": callerId}
        }
        let uri = urlHost + '/restapi/v1.0/account/~/extension/~/ring-out';
        return request.post({
                url: uri,
                headers: headers,
                body: postBody,
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

// {
//     "toPhone": "14353390656",
//     "fromPhone": "13854987732",
//     "callerId": "13854987732",
//     "playPrompt": false
// }

// {
//     "toPhone": "13854987732",
//     "fromPhone": "14353390656",
//     "callerId": "14353390656",
//     "playPrompt": false
// }