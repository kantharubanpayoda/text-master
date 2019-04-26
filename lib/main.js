var request         = require('request'),
    crypto          = require('crypto');

// Globals
var API_URL = 'https://api.textmaster.com/v1/',
    SANDBOX_API_URL = 'https://api.textmasterstaging.com/v1/';

////
//   REQUEST HANDLERS
////

// Create api signature
var createApiSignature = function(publicKey, privateKey) {
  var date = new Date().toISOString().replace('T', ' ').replace(/\..*?$/, '');
  var key = privateKey + date;
  var hmac = crypto.createHash('sha1').update(key).digest('hex');
  return {
    DATE: date,
    SIGNATURE: hmac,
    APIKEY: publicKey,
    'Content-Type': 'application/json'
  };
};

var createMethod = function(method, publicKey, privateKey, sandbox) {
  return function(uri, data, cb) {
    if (typeof data === 'function') {
      cb = data;
      data = {};
    } else if (['string', 'number'].indexOf(typeof data) !== -1) {
      data = { id: data };
    }

    var signature = createApiSignature(publicKey, privateKey);

    var options = {
      method: method,
      uri: (sandbox ? SANDBOX_API_URL : API_URL) + uri,
      headers: signature
    };

    // Add data to request
    if (method === 'GET' || method === 'DELETE') options.qs = data || {};
    else options.json = data || {};

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
      err += '\n Error Body Response is ' + JSON.stringify(res.body);
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

module.exports = function(publicKey, privateKey, sandbox) {
  var sendGet = createMethod('GET', publicKey, privateKey, sandbox),
      sendPost = createMethod('POST', publicKey, privateKey, sandbox),
      sendPut = createMethod('PUT', publicKey, privateKey, sandbox),
      sendDelete = createMethod('DELETE', publicKey, privateKey, sandbox);

  // Get ID from string or object formatted as { id: 'id' }
  var getId = function(data) {
    return data.id;
  };

  var getProject = function(data) {
    return data.projectId;
  };

  var getPage = function(data) {
    return data.page;
  };

  var getLocale = function(data) {
    return data.locale;
  };

  var abilitiesUrl = function(activity, data) {
    var url = 'clients/abilities?activity=' + activity;
    if (data.page) {
      url = url + '&page=' + data.page;
    }
    if (data.locale) {
      url = url + '&locale=' + data.locale;
    }

    return url;
  }

  // RETURN API
  return {
    abilities: {
      translation: function(params, cb) {
        sendGet(abilitiesUrl('translation', params), cb);
      },
      copywriting: function(params, cb) {
        sendGet(abilitiesUrl('copywriting', params), cb);
      },
      proofreading: function(params, cb) {
        sendGet(abilitiesUrl('proofreading', params), cb);
      },
    },
    account: {
      info: function(cb) { sendGet('clients/users/me', cb); },
    },
    project: {
      create: function(data, cb) {
        sendPost('clients/projects/', data, cb);
      },
      get: {
        single: function(params, cb) {
          sendGet('clients/projects/' + getProject(params), cb);
        },
        list: function(cb) {
          sendGet('clients/projects', cb);
        },
      },
      update: function(params, data, cb) {
        sendPut('clients/projects/' + getProject(params), data, cb);
      },
      asyncLaunch: function(params, cb) {
        sendPost('clients/projects/' + getProject(params) + '/async_launch', cb);
      }
    },
    document: {
      complete: {
        single: function(params, data, cb) {
          sendPut('clients/projects/' + getProject(params) + '/documents/' + getId(params) + '/complete', data, cb);
        },
        batch: function(params, data, cb) {
          sendPut('clients/projects/' + getProject(params) + '/batch/documents' + '/complete', data, cb);
        }
      },
      create: {
        single: function(params, data, cb) {
          sendPost('clients/projects/' + getProject(params) + '/documents', data, cb);
        },
        batch: function(params, data, cb) {
          sendPost('clients/projects/' + getProject(params) + '/batch/documents', data, cb);
        }
      },
      delete: function(params, cb) {
        sendDelete('clients/projects/' + getProject(params) + '/documents/' + getId(params), cb);
      },
      get: {
        single: function(params, cb) {
          sendGet('clients/projects/' + getProject(params) + '/documents/' + getId(params), cb);
        },
        batch: function(params, cb) {
          sendGet('clients/projects/' + getProject(params) + '/documents', cb);
        },
        filter: function(params, data, cb) {
          sendGet('clients/projects/' + getProject(params) + '/documents/filter?page=' + getPage(params) + '&where=' + JSON.stringify(data),cb);
        },
      },
      update: function(params, data, cb) {
        sendPut('clients/projects/' + getProject(params) + '/documents/' + getId(params), data, cb);
      }
    },
    service: {
      languages: function(cb) {
        sendGet('public/languages', cb);
      },
      locales: function(cb) {
        sendGet('public/locales', cb);
      },
      quote: function(data, cb) {
        sendPost('clients/projects/quotation', data, cb);
      },
      pricing: function(params, cb) {
        sendGet('public/reference_pricings/' + getLocale(params), cb);
      }
    }
  };
};
