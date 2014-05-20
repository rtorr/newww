var transform = require('./profile').transform;


module.exports = function (options) {
  return function (request, reply) {
    var getUserFromCouch = request.server.methods.getUserFromCouch;

    getUserFromCouch(request.params.name, function (err, profile) {
      reply.view('profile', transform(profile, options))
    });
  }
}