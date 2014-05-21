var Lab = require('lab'),
    describe = Lab.experiment,
    before = Lab.before,
    it = Lab.test,
    expect = Lab.expect;

var Hapi = require('hapi'),
    registry = require('../');

registry.name = 'registry';
registry.version = '0.0.1';

var server, p;
var fake = require('./fixtures/fake.json'),
    fakeDeps = require('./fixtures/fake-deps'),
    oriReadme = fake.readme;

// prepare the server
before(function (done) {
  var serverOptions = {
    views: {
      engines: {hbs: 'handlebars'},
      partialsPath: '../../hbs-partials',
      helpersPath: '../../hbs-helpers'
    }
  };

  server = Hapi.createServer(serverOptions);
  server.pack.register(registry, done);
});

describe('Retreiving packages from the registry', function () {
  var source;

  before(function (done) {
    // mock couch call
    server.methods.getPackageFromCouch = function (pkgName, next) {
      return next(null, fake);
    }

    server.methods.getBrowseData = function (type, arg, skip, limit, next) {
      return next(null, fakeDeps);
    }

    done();
  })

  it('gets a package from the registry', function (done) {
    var pkgName = 'fake';

    var options = {
      url: '/package/' + pkgName
    }

    server.ext('onPreResponse', function (request, next) {
      source = request.response.source;
      p = source.context.package;
      next();
    });

    server.inject(options, function (resp) {
      expect(resp.statusCode).to.equal(200);
      expect(source.context.package.name).to.equal(pkgName);
      done();
    });
  });

  it('sends the package to the package-page template', function (done) {
    expect(source.template).to.equal('package-page');
    done();
  });
});

describe('Modifying the package before sending to the template', function () {
  // it('parses the name based on version', function (done) {

  //   done()
  // })

  it('adds publisher is in the maintainers list', function (done) {
    expect(p.publisherIsInMaintainersList).to.exist
    done()
  })

  it('adds avatar information to author and maintainers', function (done) {
    expect(p._npmUser.avatar).to.exist
    expect(p.maintainers[0].avatar).to.exist
    expect(p._npmUser.avatar).to.include('gravatar')
    done()
  })

  it('adds an OSS license', function (done) {
    expect(p.license).to.be.an('object')
    expect(p.license.url).to.include('opensource.org')
    done()
  })

  it('turns the readme into HTML for viewing on the website', function (done) {
    expect(p.readme).to.not.equal(oriReadme)
    expect(p.readmeSrc).to.equal(oriReadme)
    expect(p.readme).to.include('<a href=')
    done()
  })

  it('turns relative URLs into real URLs', function (done) {
    expect(p.readme).to.include('/blob/master')
    done()
  })

  it('includes the dependencies', function (done) {
    expect(p.dependencies).to.exist
    done()
  })

  it('includes the dependents', function (done) {
    expect(p.dependents).to.exist
    done()
  })
});