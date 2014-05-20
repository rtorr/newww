var path = require('path')

exports.register = function User (facet, options, next) {
  facet.views({
    engines: { hbs: 'handlebars' },
    path: path.resolve(__dirname, 'templates')
  });

  facet.route({
    path: "/~{name}",
    method: "GET",
    handler: require('./show-profile')(options.profileFields)
  });

  next();
}