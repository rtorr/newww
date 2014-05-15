var Lab = require('lab')
  , describe = Lab.experiment
  , before = Lab.before
  , it = Lab.test
  , expect = Lab.expect;

var Hapi = require('hapi'),
    couch = require('../servers/hapi-couchdb'),
    registry = require('../facets/registry');

var server;

before(function (done) {
  var serverOptions = {
    views: {
      engines: {hbs: 'handlebars'},
      partialsPath: './hbs-partials',
      helpersPath: './hbs-helpers'
    }
  };

  var dbOptions = {
    "couchAuth": "admin:admin",
    "registryCouch": "http://localhost:15984/"
  }

  server = Hapi.createServer(serverOptions);
  server.pack.require({'../facets/registry': null, '../servers/hapi-couchdb': dbOptions}, done);
});



  // mock redis
  // config.redis.client = {
  //   get: function (k, cb) {
  //     if (k === 'request/')
  //       return cb(null, request)

  //     return cb(null, '')
  //   },
  //   set: function (k, d, ex, t, cb) {
  //     return cb(null, d)
  //   },
  //   ttl: function (k, cb) {
  //     if (k === 'package:'+'request/')
  //       return cb(null, 10)

  //     return cb(null, -1)
  //   }
  // }

  // // mock couch
  // npm.registry = {
  //   get: function (name, num, sth, sth2, cb) {
  //     return cb(null, fake)
  //   }
  // }

// describe('getting packages from the redis cache', function () {
//   var p

//   before(function (done) {
//     pkg('request', function (er, package) {
//       p = package
//       done()
//     })
//   })

//   it('gets a package from the redis cache', function (done) {
//     expect(p).to.not.be.a('string')
//     expect(p.name).to.equal('request')
//     done()
//   })
// })

describe('getting packages from the registry', function () {
  // var oriReadme = fake.readme
  //   , p

  // before(function (done) {
  //   pkg('fake', function (er, package) {
  //     p = package
  //     done()
  //   })
  // })

  it('gets a package from the registry', function (done) {
    var pkg = 'request'

    server.inject('/package/' + pkg, function (resp) {
      expect(resp.statusCode).to.equal(200);
      done();
    });
  });

  // it('adds publisher is in the maintainers list', function (done) {
  //   expect(p.publisherIsInMaintainersList).to.exist
  //   done()
  // })

  // it('adds avatar information to author and maintainers', function (done) {
  //   expect(p._npmUser.avatar).to.exist
  //   expect(p.maintainers[0].avatar).to.exist
  //   expect(p._npmUser.avatar).to.include('gravatar')
  //   done()
  // })

  // it('adds an OSS license', function (done) {
  //   expect(p.license).to.be.an('object')
  //   expect(p.license.url).to.include('opensource.org')
  //   done()
  // })

  // it('turns the readme into HTML for viewing on the website', function (done) {
  //   expect(p.readme).to.not.equal(oriReadme)
  //   expect(p.readmeSrc).to.equal(oriReadme)
  //   expect(p.readme).to.include('<a href=')
  //   done()
  // })

  // it('turns relative URLs into real URLs', function (done) {
  //   expect(p.readme).to.include('/blob/master')
  //   done()
  // })
})