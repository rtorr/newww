var path = require('path')

exports.register = function User (facet, options, next) {
  facet.views({
    engines: { hbs: 'handlebars' },
    path: path.resolve(__dirname, 'templates')
  });

  facet.route({
    path: "/~",
    method: "GET",
    handler: require('./show-profile')(options.profileFields)
  });

  facet.route({
    path: "/~{name}",
    method: "GET",
    handler: require('./show-profile')(options.profileFields)
  });

  facet.route({
    path: "/login",
    method: ["GET", "POST"],
    handler: require('./login')
  });

  facet.route({
    path: "/logout",
    method: "GET",
    handler: function (request, reply) {
      request.auth.session.clear();
      return reply().redirect('/');
    }
  })

  next();
}