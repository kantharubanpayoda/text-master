var _               = require('underscore'),
    request         = require('request'),
    querystring     = require('querystring'),
    crypto          = require('crypto');

// Globals
var apiBase = 'http://api.gengo.com/v2/';

////
//  SEND REQUEST
////

// Create auth GET request fn
var authedGet = function(publicKey, privateKey) {
  var ts = new Date() / 1000 | 0,
      apiSig = crypto.createHmac('sha1', privateKey).update(ts).digest('hex');
  
  return function(path, data, cb) {
    var url = apiBase + path + '?' + querystring.stringify(_.extend({ ts: ts, api_key: publicKey, api_sig: apiSig }, data));
    request.get(url, globalResponseHandler(cb));
  };
};


////
//  RESPONSE HANDLERS
////

var globalResponseHandler = function(cb) {
  return function(err, res, body) {
    if (!cb || !_.isFunction(cb)) return;

    // Catch connection errors
    if (err || !res) {
      var returnErr = 'Error connecting to Gengo';
      if (err) returnErr += ': ' + err.code;
      err = returnErr;
    } else if (res.statusCode !== 200) {
      err = 'Something went wrong. Gengo responded with a ' + res.statusCode;
    }
    if (err) return cb(err, null);

    // Try to parse response
    try {
      body = JSON.parse(body);
    } catch(e) {
      err = 'Could not parse response from Gengo: ' + body;
      return cb(err, null);
    }

    // Return response
    cb(null, body);
  };
};



////
//   PUBLIC API
////

module.exports = function(publicKey, privateKey) {
  var get = authedGet(publicKey, privateKey),
      api = {};

  // RETURN API
  return {

  };
};
