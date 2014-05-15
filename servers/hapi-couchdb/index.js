var CouchLogin = require('couch-login');

exports.register = function Couch (server, options, next) {
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

  server.method('getPackage', function (package, next) {
    anonCouch.get('/registry/' + package, function (er, cr, data) {
      next(er, data);
    })
  })

  next();
}