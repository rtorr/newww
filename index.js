var Hapi = require('hapi')
  , path = require('path')

var options = {
  views: {
    engines: {
      hbs: 'handlebars'
    },
    // path: path.resolve(__dirname, "templates"),
    partialsPath: path.resolve(__dirname, 'hbs-partials'),
    helpersPath: path.resolve(__dirname, 'hbs-helpers')
  }
};

var dbOptions = {
  "couchAuth": "admin:admin",
  "registryCouch": "http://localhost:15984/"
}

var server = new Hapi.Server('localhost', 15443, options)

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



server.pack.require({'./facets/company': null, './facets/registry': null, './servers/hapi-couchdb': dbOptions}, function(err) {
    if (err) throw err;
    server.start(function() {
        console.log('Hapi server started @ ' + server.info.uri);
    });
});

