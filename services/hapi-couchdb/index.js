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
    })
  }, {
    cache: {
      expiresIn: 60 * SECOND,
      segment: '##package:'
    }
  })

  next();
}