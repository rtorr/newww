var Lab = require('lab'),
    describe = Lab.experiment,
    before = Lab.before,
    it = Lab.test,
    expect = Lab.expect;

var Hapi = require('hapi'),
    config = require('../../../config').user,
    user = require('../');

user.name = 'user';
user.version = '0.0.1';

var server, source, u = {};
var users = require('./fixtures/users'),
    fakeBrowse = require('./fixtures/fakeuser-browse');

var username1 = 'fakeuser',
    username2 = 'fakeuserCli';

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
  server.pack.register(user, config, done);

  server.ext('onPreResponse', function (request, next) {
    source = request.response.source;
    username = source.context.title;
    u[username] = source.context;
    next();
  });

});

before(function (done) {
  server.methods = {
    getUserFromCouch: function (username, next) {
      return next(null, users[username]);
    },

    getBrowseData: function (type, arg, skip, limit, next) {
      return next(null, fakeBrowse[type])
    }
  }

  done();
});

describe('Retreiving profiles from the registry', function () {

  it('gets a website-registered user from the registry', function (done) {
    var options = {
      url: '/~' + username1
    }

    server.inject(options, function (resp) {
      expect(resp.statusCode).to.equal(200);
      done();
    });
  });

  it('gets a cli-registered user from the registry', function (done) {
    var options = {
      url: '/~' + username2
    }

    server.inject(options, function (resp) {
      expect(resp.statusCode).to.equal(200);
      done();
    });
  });

  it('sends the profile to the profile template', function (done) {
    expect(source.template).to.equal('profile');
    done();
  });

});

describe('Modifying the profile before sending it to the template', function () {
  it('sends the transformed profile', function (done) {
    expect(u[username1].showprofile.name).to.equal(username1);
    expect(u[username2].showprofile.name).to.equal(username2);
    done();
  });

  it('separates the fields from the original profile', function (done) {
    expect(u[username1].fields).to.equal(users[username1].fields);
    expect(u[username2].fields).to.equal(users[username2].fields);
    done();
  });

  it('randomly sorts the packages list', function (done) {
    expect(u[username1].packages.sort()).to.deep.equal(fakeBrowse['author'].sort());
    expect(u[username2].packages.sort()).to.deep.equal(fakeBrowse['author'].sort());
    done();
  });

  it('cuts the stars list down to the MAX_COUNT and adds some "more" text', function (done) {
    expect(fakeBrowse['userstar'].length).to.be.gt(20);
    expect(u[username1].starred.length).to.equal(21);
    expect(u[username1].starred[20].name).to.include('more');
    expect(u[username2].starred.length).to.equal(21);
    expect(u[username2].starred[20].name).to.include('more');
    done();
  });

  it('includes avatar links', function (done) {
    expect(u[username1].showprofile.avatar).to.exist;
    expect(u[username1].showprofile.avatar).to.contain('gravatar');
    expect(u[username2].showprofile.avatar).to.exist;
    expect(u[username2].showprofile.avatar).to.contain('gravatar');
    done();
  });

});
