var CouchLogin = require('couch-login'),
    SECOND = 1000;

exports.register = function Couch (service, options, next) {
  var adminCouch, anonCouch;

  if (options.couchAuth) {
    var ca = options.couchAuth.split(':'),
        name = ca.shift(),
        password = ca.join(':'),
        auth = { name: name, password: password };

    // the admin couch uses basic auth, or couchdb freaks out eventually
    adminCouch = new CouchLogin(options.registryCouch, 'basic');
    adminCouch.strictSSL = false;
    adminCouch.login(auth, function (er, cr, data) {
      if (er) throw er;
    });
  }

  anonCouch = new CouchLogin(options.registryCouch, NaN);

  service.method('getPackageFromCouch', function (package, next) {
    anonCouch.get('/registry/' + package, function (er, cr, data) {
      next(er, data);
    });
  }, {
    cache: {
      expiresIn: 60 * SECOND,
      segment: '##package'
    }
  });

  service.method('getUserFromCouch', function (name, next) {
    anonCouch.get('/_users/org.couchdb.user:' + name, function (er, cr, data) {
      if (er || cr & cr.statusCode !== 200 || !data) {
        return next(er)
      }

      return next(null, data)
    })
  }, {
    cache: {
      expiresIn: 60 * SECOND,
      segment: '##session'
    }
  });

  service.method('getBrowseData', require('./browse')(anonCouch), {
    cache: {
      expiresIn: 60 * SECOND,
      segment: '##browse'
    }
  })

  service.method('loginUser', function (loginDetails, next) {
    anonCouch.login(loginDetails, function (er, cr, couchSession) {

      if (er) {
        return next (new Error(er));
      }

      if (cr.statusCode !== 200) {
        return next(new Error('Username and/or Password is wrong'));
      }
      // console.log(couchSession)
      service.methods.getUserFromCouch(loginDetails.name, function (err, data) {
        // console.log(data)
        return next(null, data);
      });
    })
  })

  next();
}


