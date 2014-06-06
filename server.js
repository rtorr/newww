var Hapi = require('hapi'),
    config = require('./config.js')

var server = new Hapi.Server(config.host, config.port, config.server)

server.route({
  path: '/favicon.ico',
  method: 'GET',
  handler: { file: './favicon.ico' }
})

server.route({
  path: '/static/{path*}',
  method: 'GET',
  handler: {
    directory: {
      path: './static',
      listing: false,
      index: false
    }
  }
});

server.pack.require({
  'hapi-auth-cookie': null,
  './facets/company': null,
  './facets/registry': null,
  './facets/user': config.user,
  './services/hapi-couchdb': config.couch
}, function(err) {
    if (err) throw err;

    var cache = server.cache('sessions', {
      expiresIn: config.session.expiresIn
    });

    server.app.cache = cache;

    server.auth.strategy('session', 'cookie', 'try', {
      password: config.session.password,
      cookie: config.session.cookie,
      redirectTo: '/login',
      appendNext: true,
      validateFunc: function (session, callback) {
        cache.get(session.sid, function (err, cached) {
          // use this spot here to verify user is still logged into couch

          if (err) {
            return callback(err, false);
          }
          if (!cached) {
            return callback(null, false);
          }

          return callback(null, true, cached.item)
        })
      }
    });

    server.start(function() {
        console.log('Hapi server started @ ' + server.info.uri);
    });
});

