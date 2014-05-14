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

var server = new Hapi.Server('localhost', 8080, options)

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

server.route({
  path: '/stylus/{path*}',
  method: 'GET',
  handler: {
    directory: {
      path: './stylus',
      listing: false,
      index: false
    }
  }
})

server.pack.require(['./facets/company', './facets/registry'], function(err) {
    if (err) throw err;
    server.start(function() {
        console.log('Hapi server started @ ' + server.info.uri);
    });
});

