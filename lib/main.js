var _               = require('underscore'),
    request         = require('request'),
    querystring     = require('querystring'),
    crypto          = require('crypto');

// Globals
var apiBase = 'http://api.gengo.com/v2/';
var sandboxApiBase = 'http://api.sandbox.gengo.com/v2/'

////
//   REQUEST HANDLERS
////

// Create api signature
var createApiSignature = function(publicKey, privateKey, sandbox) {
  var ts = new Date() / 1000 | 0;
  return {
    ts: ts,
    api_sig: crypto.createHmac('sha1', privateKey).update(ts.toString()).digest('hex'),
    api_key: publicKey
  };
};

var createMethod = function(method, signature, sandbox) {
  return function(uri, data, cb) {
    if (_.isFunction(data)) {
      cb = data;
      data = {};
    }

    var options = {
      method: method,
      uri: (sandbox ? sandboxApiBase : apiBase) + uri,
      headers: {
        'Accept': 'application/json'
      }
    };

    data = _.extend(data, signature);
    if (method === 'GET' || method === 'DELETE') options.qs = data;
    if (method === 'POST' || method === 'PUT') options.json = data;

    var req = request(options, globalResponseHandler(cb));
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

module.exports = function(publicKey, privateKey, sandbox) {
  var signature = createApiSignature(publicKey, privateKey),
      sendGet = createMethod('GET', signature, sandbox),
      sendPost = createMethod('POST', signature, sandbox),
      sendPut = createMethod('PUT', signature, sandbox),
      sendDelete = createMethod('DELETE', signature, sandbox),
      api = {};

  // RETURN API
  return {
    account: {
      balance: function(cb) {
        sendGet('account/balance', cb);
      }
    }
  };
};

