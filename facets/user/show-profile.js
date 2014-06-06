var transform = require('./presenters/profile').transform;


module.exports = function (options) {
  return function (request, reply) {

    var opts = {
      user: request.auth.credentials
    }

    var getUserFromCouch = request.server.methods.getUserFromCouch;
    var getBrowseData = request.server.methods.getBrowseData;

    getUserFromCouch(request.params.name, function (err, showprofile) {
      getBrowseData('userstar', request.params.name, 0, 1000, function (err, starred) {
        getBrowseData('author', request.params.name, 0, 1000, function (err, packages) {

          opts.profile = {
            showprofile: transform(showprofile, options),
            // profile: req.model.profile,
            fields: showprofile.fields,
            title: showprofile.name,
            // hiring: req.model.whoshiring,
            packages: getRandomAssortment(packages, 'packages', request.params.name),
            starred: getRandomAssortment(starred, 'starred', request.params.name)
          }

          reply.view('profile', opts)
        });
      });
    });
  }
}

function getRandomAssortment (items, browseKeyword, name) {
  var l = items.length;
  var MAX_SHOW = 20;

  if (l > MAX_SHOW) {
    items = items.sort(function (a, b) {
      return Math.random() * 2 - 1
    }).slice(0, MAX_SHOW);
    items.push({
      url: '/browse/' + browseKeyword + '/' + name,
      name: 'and ' + (l - MAX_SHOW) + ' more',
      description: ''
    })
  }

  return items;
}




