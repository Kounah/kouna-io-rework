const https = require('https');
const config = require('../../config');
const qs = require('querystring');

function verify(req, callback) {
  var query = qs.stringify({
      'secret': config.recaptcha.secret,
      'response': req.body['g-recaptcha-response'],
      'remoteip': req.connection.remoteAddress
    });

    console.log(query);

    var options = {
      hostname: 'www.google.com',
      port: 443,
      path: '/recaptcha/api/siteverify?' + query,
      method: 'POST',
    }

    var request = https.request(options, (result) => {
      if(result.statusCode != 200) {
        callback('statusCode was: ' + result.statusCode, null);
      }

      result.on('data', (d) => {
        try {
          var jsonResult = JSON.parse(d);
          callback(null, jsonResult);
        } catch (err) {
          callback(err, null);
        }
      })
    })

    request.on('error', (e) => {
      callback(e, null);
    })

    request.end();
}

module.exports = {
  verify
}