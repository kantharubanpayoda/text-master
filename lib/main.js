var request         = require('request'),
    crypto          = require('crypto');

// Globals
var API_URL = 'http://api.textmaster.com/v1/';
var SANDBOX_ID = '55df915d34e62c0016000538';

////
//   REQUEST HANDLERS
////

// Create api signature
var createApiSignature = function(publicKey, privateKey) {
  var date = new Date() / 1000 | 0;
  return {
    DATE: date,
    SIGNATURE: crypto.createHmac('sha1', privateKey + date.toString()),
    APIKEY: publicKey
  };
};

var createMethod = function(method, signature) {
  return function(uri, data, cb) {
    if (typeof data === 'function') {
      cb = data;
      data = {};
    } else if (['string', 'number'].indexOf(typeof data) !== -1) {
      data = { id: data };
    }

    var options = {
      method: method,
      uri: API_URL + uri,
      headers: { 'Accept': 'application/json' }
    };

    // Add data to request
    if (method === 'GET' || method === 'DELETE') options.qs = data || {};
    else options.form = { data: JSON.stringify(data) || {} };

    // Add signature
    for (var prop in signature) (options.form || options.qs)[prop] = signature[prop];

    request(options, globalResponseHandler(cb));
  };
};


////
//   RESPONSE HANDLERS
////

var globalResponseHandler = function(cb) {
  return function(err, res, body) {
    if (typeof cb !== 'function') return;

    // Catch connection errors
    if (err || !res) {
      var returnErr = 'Error connecting to Textmaster';
      if (err) returnErr += ': ' + err.code;
      err = returnErr;
    } else if (res.statusCode !== 200) {
      err = 'Something went wrong. Textmaster responded with a ' + res.statusCode;
    }
    if (err) return cb(err, null);

    // Try to parse response
    if (body !== Object(body)) {
      try {
        body = JSON.parse(body);
      } catch(e) {
        return cb('Could not parse response from Textmaster: ' + body, null);
      }
    }

    // Check for error returned in a 200 response
    if (body.opstat === 'error') {
      if (body.err) return cb(body.err);
      return cb(err);
    }

    // Make sure response is OK
    if (body.opstat === 'ok') body = body.response;

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
      sendDelete = createMethod('DELETE', signature);

  // Get ID from string or object formatted as { id: 'id' }
  var getDocument = function(data) {
    return data.documentId;
  };

  var getProject = function(data) {
    return data.projectId;
  };

  // RETURN API
  return {
    account: {
      info: function(cb) { sendGet('clients/users/me', cb); },
    },
    projects: {
      create: function(data, cb) {
        sendPost('clients/projects/', data, cb);
      },
      get: {
        single: function(data, cb) {
          sendGet('clients/projects/' + getProject(data), data, cb);
        },
        list: function(data, cb) {
          sendGet('clients/projects', data, cb);
        },
      },
      update: function(data, cb) {
        sendPut('clients/projects/' + getProject(data), data, cb);
      },
      launch: function(data, cb) {
        sendPut('clients/projects/' + getProject(data) + '/launch', data, cb)''
      }
    },
    documents: {
      complete: {
        single: function(data, cb) {
          sendPut('clients/projects/' + getProject(data) + '/documents/' + getDocument(data) + '/complete', data, cb);
        },
        batch: function(data, cb) {
          sendPut('clients/projects/' + getProject(data) + '/batch/documents' + '/complete', data, cb);
        }
      },
      create: {
        single: function(data, cb) {
          sendPost('clients/projects/' + getProject(data) + '/documents', data, cb);
        },
        batch: function(data, cb) {
          sendPost('clients/projects/' + getProject(data) + '/batch/documents', data, cb);
        }
      },
      delete: function(data, cb) {
        sendDelete('clients/projects/' + getProject(data) + '/documents/' + getDocument(data), data, cb);
      },
      get: {
        single: function(data, cb) {
          sendGet('clients/projects/' + getProject(data) + '/documents/' + getDocument(data), data, cb);
        },
        batch: function(data, cb) {
          sendGet('clients/projects/' + getProject(data) + '/documents', data, cb);
        },
        filter: function(data, cb) {
          sendGet('clients/projects/' + getProject(data) + '/documents/filter' + getDocument(data), data, cb);
        },
      },
      update: function(data, cb) {
        sendPut('clients/projects/' + getProject(data) + '/documents/' + getDocument(data), data, cb);
      }
    },
    service: {
      languages: function(data, cb) {
        sendGet('public/languages', data, cb);
      },
      quote: function(data, cb) {
        sendPost('clients/projects/quotation', data, cb);
      }
    }
  };
};
