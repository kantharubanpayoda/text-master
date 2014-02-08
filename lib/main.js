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

var createMethod = function(method, signature) {
  return function(uri, data, cb) {

    var options = {
      method: method,
      uri: apiBase + uri
    };

    data = _.extend(data, signature, {sandbox: true});
    if (method === 'GET' || method === 'DELETE') options.qs = querystring.stringify(data);
    if (method === 'POST' || method === 'PUT') options.json = data;

    request(options, globalResponseHandler(cb));
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
      return cb('Could not parse response from Gengo: ' + body, null);
    }

    // Return response
    cb(null, body);
  };
};



////
//   PUBLIC API
////

module.exports = function(publicKey, privateKey) {
  var signature = createApiSignature(publicKey, privateKey),
      sendGet = createMethod('GET', signature),
      sendPost = createMethod('POST', signature),
      sendPut = createMethod('PUT', signature),
      sendDelete = createMEthod('DELETE', signature),
      api = {};

  // RETURN API
  return {
    account: {
      balance: function(cb) {
        api.sendGet('account/balance', cb);
      }
    }
  };
};
