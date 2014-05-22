var Lab = require('lab')
  , describe = Lab.experiment
  , before = Lab.before
  , it = Lab.test
  , expect = Lab.expect;

var Hapi = require('hapi'),
    user = require('../facets/user');

user.name = 'user';
user.version = '0.0.1';

var server;

before(function (done) {
  server = Hapi.createServer();
  server.pack.register(user, done);
});

describe('user is routing properly', function () {
  it('calls all the right routes', function (done) {
    var table = server.table();

    expect(table).to.have.length(2);
    expect(table[0].path).to.equal('/~');
    expect(table[1].path).to.equal('/~{name}');

    done();
  })
})