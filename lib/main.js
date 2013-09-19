var _               = require('underscore'),
    request         = require('request'),
    querystring     = require('querystring'),
    crypto          = require('crypto');

// Globals
var apiBase = 'http://api.gengo.com/v2/';

////
//   REQUEST HANDLERS
////

// Create api signature
var createApiSignature = function(publicKey, privateKey) {
  var ts = new Date() / 1000 | 0;
  return {
    ts: ts,
    api_sig: crypto.createHmac('sha1', privateKey).update(ts).digest('hex'),
    api_key: publicKey
  };
};

// Create auth GET request fn
var authedGet = function(publicKey, privateKey) {
  var signature = createApiSignature(publicKey, privateKey);

  return function(path, data, cb) {
    data = querystring.stringify(_.extend(data, signature));
    var url = apiBase + path + '?' + data;
    request.get(url, globalResponseHandler(cb));
  };
};

// Create auth POST request fn
var authedPost = function(publicKey, privateKey) {
  var signature = createApiSignature(publicKey, privateKey);
  
  return function(path, data, cb) {
    _.extend(data, signature);
    request.post(apiBase + path, data, globalResponseHandler(cb));
  };
};


////
//   RESPONSE HANDLERS
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
      post = authedPost(publicKey, privateKey),
      api = {};

  // RETURN API
  return {

  };
};
