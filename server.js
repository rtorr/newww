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

    server.auth.strategy('session', 'cookie', 'try', {
      password: config.authPass,
      cookie: 's',
      redirectTo: '/login',
    });

    server.start(function() {
        console.log('Hapi server started @ ' + server.info.uri);
    });
});

