var murmurhash = require('murmurhash');

module.exports = function login (request, reply) {
  var loginUser = request.server.methods.loginUser;

  if (request.auth.isAuthenticated) {
    return reply().redirect('/');
  }

  var opts = {};

  if (request.method === 'post') {

    if (!request.payload.name || !request.payload.password) {
      opts.message = 'Missing username or password';
    } else {
      loginUser(request.payload, function (er, user) {
        if (!user) {
          opts.message = 'Invalid username or password';

          reply.view('login', opts);
        }

        var sid = murmurhash.v3(user.name, 55).toString(16);

        user.sid = sid;

        request.server.app.cache.set(sid, user, 0, function (err) {
          if (err) {
            console.error("BOOM");
            reply(err);
          }

          request.auth.session.set({sid: sid});
          // ?? how do we handle ?done=/blah ??
          return reply().redirect('/');
        });
      })
    }
  }

  if (request.method === 'get' || opts.message) {
    // console.log(opts.message)
    return reply.view('login', opts)
  }
}
